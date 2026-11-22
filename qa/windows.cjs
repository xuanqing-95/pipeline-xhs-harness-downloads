const { chromium } = require('playwright-core');
const { spawn, execFileSync } = require('node:child_process');
const fs = require('node:fs');
const delay = ms => new Promise(r => setTimeout(r, ms));
const packageName = 'dsh-pipeline-xhs';
const gitCandidate = process.env.QA_CHANNEL === 'git-candidate';
const upgrade = process.env.QA_CHANNEL === 'npm-upgrade';
const previous = '0.5.4-beta.56';
const candidate = process.env.QA_CANDIDATE;
if (gitCandidate && !/^[a-f0-9]{40}$/.test(candidate)) throw Error('Invalid release candidate commit');
const out = 'qa/evidence';
fs.mkdirSync(out,{recursive:true});
const child = spawn(process.env.DSH_TEST_EXE,['--remote-debugging-port=9333','--lang=en-US'],{stdio:'ignore'});
let browser, current, last = '', stage = 'launch';
const report = msg => console.log(msg);
async function shot(name){ await current.screenshot({path:out+'/'+name+'.png',timeout:5000}); }
async function visible(loc){return await loc.first().isVisible().catch(()=>false);}
(async()=>{
 const metadata = await fetch(gitCandidate
   ? 'https://raw.githubusercontent.com/xuanqing-95/pipeline-xhs-harness-downloads/' + candidate + '/package.json'
   : 'https://registry.npmjs.org/' + packageName);
 if (!metadata.ok) throw Error('Cannot resolve the expected plugin version');
 const manifest = await metadata.json();
 const latest = gitCandidate ? manifest.version : manifest['dist-tags'].latest;
 const exact = process.env.QA_CHANNEL === 'npm-exact';
 const source = gitCandidate ? 'https://github.com/xuanqing-95/pipeline-xhs-harness-downloads#' + candidate : (upgrade || exact) ? packageName+'@'+(upgrade ? previous : latest) : packageName;
 const version = upgrade ? previous : latest;
 report('Testing install of ' + source + ' ' + version);
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
    if (upgrade) {
      await pg.getByText('发现新版 ' + latest, {exact:true}).first().waitFor({timeout:45000});
      await shot('04-update-available');
      await pg.getByRole('button',{name:'立即更新',exact:true}).first().click();
      const path = require('node:path');
      const installed = path.join(process.env.DSH_HOME || path.join(require('node:os').homedir(),'.dsh'),'profiles','desktop','node_modules',packageName,'package.json');
      for(let poll=0;poll<90;poll++){
        if(fs.existsSync(installed) && JSON.parse(fs.readFileSync(installed)).version===latest){
          report('PASS: Clicked the update notice and verified installed package '+previous+' -> '+latest);
          return;
        }
        await delay(1000);
      }
      throw Error('Update button did not install '+latest);
    }
    await shot('04-plugin-open');fs.writeFileSync(out+'/result.json',JSON.stringify({platform:process.platform,source,version,result:'installed, enabled and opened via Windows desktop UI'}));report('PASS: Installed ' + source + ' ' + version + ' and opened plugin login');return;
   }
  }
  await delay(1300);
 }
 throw Error('Desktop did not complete stage: '+stage);
})().catch(async e=>{console.error(e.message);if(current&&!current.isClosed()){console.log((await current.locator('body').innerText()).slice(-3500));await shot('last-screen').catch(()=>{});}process.exitCode=1;}).finally(async()=>{if(browser)await browser.close().catch(()=>{});child.kill();});
