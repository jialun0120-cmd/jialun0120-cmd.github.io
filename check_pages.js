const https = require('https');
let jar = '';

function req(method, path, data) {
  return new Promise((resolve, reject) => {
    const opts = {hostname:'gitee.com',path,method,headers:{'User-Agent':'Mozilla/5.0'}};
    if (jar) opts.headers.Cookie = jar;
    if (data) opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    const r = https.request(opts, res => {
      let b = '';
      res.on('data',c=>b+=c);
      res.on('end',()=>{
        if (res.headers['set-cookie']) jar = res.headers['set-cookie'].map(x=>x.split(';')[0]).join('; ');
        resolve({s:res.statusCode,b,loc:res.headers.location});
      });
    });
    r.on('error',reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  const login = await req('POST','/login','user%5Blogin%5D=pusieducation&user%5Bpassword%5D=sun950120&user%5Bremember_me%5D=1');
  if (login.loc) await req('GET','/');
  const page = await req('GET','/pusieducation/xinlizixun-shi-quiz/pages');
  console.log('Pages page status:', page.s);
  if (page.s === 200 && page.b) {
    console.log('PAGES IS ACCESSIBLE!');
    let found = '';
    let idx = page.b.indexOf('_csrf_token');
    if (idx > 0) {
      let sub = page.b.substring(idx, idx + 100);
      let vs = sub.indexOf('value=');
      if (vs > 0) {
        let start = sub.indexOf('"', vs) + 1;
        let end = sub.indexOf('"', start);
        if (start > 0 && end > start) found = sub.substring(start, end);
      }
    }
    if (!found) {
      idx = page.b.indexOf('authenticity_token');
      if (idx > 0) {
        let sub = page.b.substring(idx, idx + 100);
        let vs = sub.indexOf('value=');
        if (vs > 0) {
          let start = sub.indexOf('"', vs) + 1;
          let end = sub.indexOf('"', start);
          if (start > 0 && end > start) found = sub.substring(start, end);
        }
      }
    }
    if (found) {
      console.log('CSRF token found, enabling Pages...');
      let fd = 'utf8=%E2%9C%93&_csrf_token=' + encodeURIComponent(found) + '&pages%5Bsource%5D%5Bbranch%5D=master&commit=%E5%90%AF%E5%8A%A8%E9%A1%B5%E9%9D%A2';
      let r2 = await req('POST','/pusieducation/xinlizixun-shi-quiz/pages',fd);
      console.log('Result:', r2.s, r2.loc||'');
      if (r2.b) console.log(r2.b.substring(0,500));
    } else {
      console.log('No CSRF token. Checking page content...');
      console.log(page.b.substring(1800,3500));
    }
  } else {
    console.log('Not accessible, status:', page.s);
    if (page.b) console.log(page.b.substring(0,400));
  }
}
main().catch(e=>console.log('Error:',e.message));
