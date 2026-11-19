const { chromium } = require('playwright-core');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const delay = ms => new Promise(r => setTimeout(r, ms));
const repo = 'https://github.com/xuanqing-95/pipeline-xhs-harness-downloads';
const out = 'qa/evidence';
fs.mkdirSync(out,{recursive:true});
const child = spawn(process.env.DSH_TEST_EXE,['--remote-debugging-port=9333','--lang=en-US'],{stdio:'ignore'});
let browser, current, last = '', stage = 'launch';
const report = msg => console.log(msg);
async function shot(name){ await current.screenshot({path:out+'/'+name+'.png',timeout:5000}); }
async function visible(loc){return await loc.first().isVisible().catch(()=>false);}
(async()=>{
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
    await input.first().fill(repo);await shot('01-add-plugin');
    const install=pg.getByRole('button',{name:/^(Install|安装)$/i});
    await install.last().click();stage='installing';continue;
   }
   if(stage==='installing'){
    const panel=pg.getByText(/Pipeline\s*[|｜]\s*小红书内容生成/);
    if(await visible(panel)){await shot('02-installed');await panel.first().click();stage='open';continue;}
    const confirm=pg.getByRole('button',{name:/^(Confirm|Confirm installation|确认安装|确认)$/i});
    if(await visible(confirm))await confirm.last().click();
   }
   if(stage==='open' && /登录|邮箱|邮箱地址|Email/i.test(body) && /Pipeline|派獭/i.test(body)){
    await shot('03-plugin-open');fs.writeFileSync(out+'/result.json',JSON.stringify({platform:process.platform,repository:repo,result:'installed and opened via Windows desktop UI'}));report('PASS: Installed from GitHub and opened plugin login');return;
   }
  }
  await delay(1300);
 }
 throw Error('Desktop did not complete stage: '+stage);
})().catch(async e=>{console.error(e.message);if(current&&!current.isClosed()){console.log((await current.locator('body').innerText()).slice(-3500));await shot('last-screen').catch(()=>{});}process.exitCode=1;}).finally(async()=>{if(browser)await browser.close().catch(()=>{});child.kill();});
