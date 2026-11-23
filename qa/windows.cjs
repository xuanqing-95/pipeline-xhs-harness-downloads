const { chromium } = require('playwright-core');
const { spawn, execFileSync } = require('node:child_process');
const fs = require('node:fs');
const delay = ms => new Promise(r => setTimeout(r, ms));
const packageName = 'dsh-pipeline-xhs';
const mirror = process.env.QA_CHANNEL === 'mainland';
const registryHost = mirror ? 'registry.npmmirror.com' : 'registry.npmjs.org';
const version = '0.5.5';
const source = packageName;
const path = require('node:path');
const profile = path.join(require('node:os').homedir(), '.dsh', 'profiles', 'desktop');
const installedDir = path.join(profile, 'node_modules', packageName);
if (fs.existsSync(installedDir)) throw Error('Profile already has Pipeline installed');
const out = 'qa/evidence';
fs.mkdirSync(out,{recursive:true});
const child = spawn(process.env.DSH_TEST_EXE,['--remote-debugging-port=9333','--lang=en-US'],{stdio:'ignore'});
let browser, current, last = '', stage = 'launch';
const report = msg => console.log(msg);
async function shot(name){ await current.screenshot({path:out+'/'+name+'.png',timeout:5000}); }
async function visible(loc){return await loc.first().isVisible().catch(()=>false);}
(async()=>{
 report('Fresh Windows desktop. Testing bare name ' + source + ' via ' + registryHost);
 for(let i=0;i<100&&!browser;i++){
   try{browser=await chromium.connectOverCDP('http://127.0.0.1:9333',{timeout:1500});}catch{await delay(1200);}
 }
 if(!browser) throw Error('Failed to connect to Windows desktop UI');
 for(let i=0;i<200;i++){
  for(const pg of browser.contexts().flatMap(c=>c.pages())){
   if(pg.isClosed())continue;
   let body;try{body=await pg.locator('body').innerText({timeout:1500});}catch{continue;}
   current=pg;
   const msg=body.slice(0,160).replace(/\s+/g,' '); if(msg!==last){report(stage+' '+msg);last=msg;}
   if(await visible(pg.locator('#skip-key'))){await pg.locator('#skip-key').click();continue;}
   if(await visible(pg.locator('#api-key'))){await pg.locator('#api-key').click();continue;}
   if(stage==='launch'){
    const add=pg.getByRole('button',{name:/^(Add [pP]lugin|添加插件)$/i});
    if(await visible(add)){await add.first().click();stage='dialog';continue;}
    const manager=pg.getByText(/^(插件|Plugins)$/i);
    if(await visible(manager)){await manager.first().click();continue;}
   }
   if(stage==='dialog'){
    const input=pg.getByPlaceholder(/whale-pet/i);
    if(!await visible(input))continue;
    const picker = pg.getByRole('button', {name:/^(Registry|安装源)/i}).first();
    await picker.click();
    const panel = pg.locator('[data-install-registry]');
    const target = panel.locator('label').filter({hasText:mirror ? /registry[.]npmmirror[.]com|Mainland China mirror|中国大陆镜像源/i : /registry[.]npmjs[.]org|Official npm registry|npm 官方源/i}).first();
    await target.waitFor({state:'visible',timeout:10000});
    report('Selected source: ' + await target.innerText());
    await target.click();
    if(await panel.isVisible())await picker.click();
    execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','Set-Clipboard -Value $env:QA_INSTALL_SPEC'],{env:{...process.env,QA_INSTALL_SPEC:source}});
    await input.first().focus();await input.first().press('Control+v');
    if(await input.first().inputValue()!==source)throw Error('Clipboard paste mismatch');await shot('01-add-plugin');
    const install=pg.getByRole('button',{name:/^(Install|安装)$/i});
    await install.last().click();stage='installing';continue;
   }
   if(stage==='installing'){
    const enable=pg.getByRole('button',{name:/^(Enable now|立即启用|现在启用)$/i});
    if(await visible(enable)){
      // The completed receipt and its version can render just after the progress view.
      const versionLabel = new RegExp('^(?:Version|版本)\\s*' + version.replaceAll('.', '\\.') + '$', 'i');
      await pg.getByText(versionLabel).first().waitFor({state:'visible',timeout:10000});
      await shot('02-installed');await enable.first().click();stage='enabled';continue;
    }
   }
   if(stage==='enabled'){
    const panel=pg.getByText(/Pipeline\s*[|｜]\s*小红书内容生成/);
    if(await visible(panel)){await shot('03-enabled');await panel.first().click();stage='open';continue;}
    const more=pg.getByRole('button',{name:/^(More|更多)$/i}); if(i%8===0 && await visible(more))await more.first().click();
    const confirm=pg.getByRole('button',{name:/^(Confirm|Confirm installation|确认安装|确认)$/i});
    if(await visible(confirm))await confirm.last().click();
   }
   if(stage==='open' && await visible(pg.locator('input[type=password]')) && /Pipeline/.test(body)){
    const installedVersion = JSON.parse(fs.readFileSync(path.join(installedDir,'package.json'),'utf8')).version;
    if(installedVersion!==version)throw Error('Actual installed version: '+installedVersion);
    const marker = JSON.parse(fs.readFileSync(path.join(installedDir,'ui-release.json'),'utf8'));
    const actualDigest = require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(installedDir,'client.js'))).digest('hex');
    if(marker.moduleId!==source || marker.sha256!==actualDigest)throw Error('Client identity mismatch');
    await shot('04-plugin-open');fs.writeFileSync(out+'/result.json',JSON.stringify({platform:process.platform,source,registryHost,installedVersion,clientSha256:actualDigest,version,result:'installed, enabled and opened via Windows desktop UI'}));report('PASS: Installed ' + source + ' ' + version + ' and opened plugin login');return;
   }
  }
  await delay(1300);
 }
 throw Error('Desktop did not complete stage: '+stage);
})().catch(async e=>{console.error(e.message);if(current&&!current.isClosed()){console.log((await current.locator('body').innerText()).slice(-3500));await shot('last-screen').catch(()=>{});}process.exitCode=1;}).finally(async()=>{if(browser)await browser.close().catch(()=>{});child.kill();});
