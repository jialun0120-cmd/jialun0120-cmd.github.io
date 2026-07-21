const https = require('https');
let jar = '';
function req(m,p,d) {
  return new Promise((rs,rj)=>{
    const o = {hostname:'gitee.com',path:p,method:m,headers:{'User-Agent':'Mozilla/5.0'}};
    if (jar) o.headers.Cookie = jar;
    if (d) o.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    const r = https.request(o,res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{
      if (res.headers['set-cookie']) jar = res.headers['set-cookie'].map(x=>x.split(';')[0]).join('; ');
      rs({s:res.statusCode,b,loc:res.headers.location});
    })});
    r.on('error',rj); if (d) r.write(d); r.end();
  });
}
async function main() {
  await req('POST','/login','user%5Blogin%5D=pusieducation%26user%5Bpassword%5D=sun950120%26user%5Bremember_me%5D=1');
  await req('GET','/');
  const r = await req('GET','/pusieducation/xinlizixun-shi-quiz');
  const body = r.b;
  
  // Search for hrefs containing service/pages-related terms
  let searchTerms = ['service','pages','Pages','ci','deploy','gitee-pages'];
  let pos = 0;
  while (pos < body.length) {
    let hrefIdx = body.indexOf('href=', pos);
    if (hrefIdx < 0) break;
    let quote = body[hrefIdx + 5];
    if (quote !== '"' && quote !== "'") { pos = hrefIdx + 6; continue; }
    let endIdx = body.indexOf(quote, hrefIdx + 6);
    if (endIdx < 0) break;
    let href = body.substring(hrefIdx + 6, endIdx);
    pos = endIdx + 1;
    for (let t of searchTerms) {
      if (href.indexOf(t) >= 0) {
        console.log('Found:', href);
        break;
      }
    }
  }
  
  // Also look for specific keywords in the page
  let keywords = ['Gitee Pages','静态页面托管','Pages','开启页面','启动页面'];
  for (let kw of keywords) {
    let idx = body.indexOf(kw);
    if (idx >= 0) {
      let ctx = body.substring(Math.max(0,idx-100), idx+150);
      let clean = ctx.replace(/<[^>]*>/g,' ').replace(/\\s+/g,' ').trim();
      console.log(kw + ' ->', clean.substring(0,150));
    }
  }
  
  // Look for service dropdown links specifically
  let srvIdx = body.indexOf('git-project-service');
  if (srvIdx >= 0) {
    let srvArea = body.substring(srvIdx, srvIdx + 3000);
    let hrefs = srvArea.match(/href=\"([^\"]+)\"/g);
    if (hrefs) {
      console.log('\\nService dropdown links:');
      hrefs.forEach(h => console.log('  ', h));
    }
  }
}
main().catch(e=>console.log('Error:',e.message));
