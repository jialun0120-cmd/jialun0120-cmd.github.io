const https = require('https');
let jar = '';

function req(method, path, data) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'gitee.com', path, method,
      headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    };
    if (jar) opts.headers.Cookie = jar;
    if (data) opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    const r = https.request(opts, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        if (res.headers['set-cookie']) jar = res.headers['set-cookie'].map(x => x.split(';')[0]).join('; ');
        resolve({status: res.statusCode, body: b, loc: res.headers.location});
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
async function main() {
  const loginData = 'user%5Blogin%5D=pusieducation&user%5Bpassword%5D=sun950120&user%5Bremember_me%5D=1';
  const login = await req('POST', '/login', loginData);
  console.log('Login:', login.status);
  if (login.loc) await req('GET', '/');

  // Try accessing the pages page
  const page = await req('GET', '/pusieducation/xinlizixun-shi-quiz/pages');
  console.log('Pages page status:', page.status);

  if (page.body && page.status === 200) {
    console.log('PAGES PAGE IS ACCESSIBLE!');
    // Search for csrf token
    let token = null;
    let idx = page.body.indexOf('_csrf_token');
    if (idx >= 0) {
      let slice = page.body.substring(idx, idx + 100);
      let vm = slice.match(/value=\"([^\"]+)\"/);
      if (vm) token = vm[1];
    }
    if (!token) {
      idx = page.body.indexOf('authenticity_token');
      if (idx >= 0) {
        let slice = page.body.substring(idx, idx + 100);
        let vm = slice.match(/value=\"([^\"]+)\"/);
        if (vm) token = vm[1];
      }
    }
    if (token) {
      console.log('CSRF token found, enabling pages...');
      let fb = 'utf8=%E2%9C%93&_csrf_token=' + encodeURIComponent(token) + '&pages%5Bsource%5D%5Bbranch%5D=master&commit=%E5%90%AF%E5%8A%A8%E9%A1%B5%E9%9D%A2';
      let r2 = await req('POST', '/pusieducation/xinlizixun-shi-quiz/pages', fb);
      console.log('Enable result:', r2.status, r2.loc || '');
    } else {
      console.log('No CSRF token found.');
      let enableBtn = page.body.match(/btn[^>]*>[^<]*开启[^<]*</) || page.body.match(/btn[^>]*>[^<]*启用[^<]*</);
      if (enableBtn) console.log('Enable button:', enableBtn[0]);
      console.log('Page content around form:', page.body.substring(2000, 4000));
    }
  } else if (page.status === 403) {
    console.log('Still 403 - pages not available. Account might need more verification.');
    console.log('Body snippet:', (page.body || '').substring(0, 300));
  } else {
    console.log('Status:', page.status);
    console.log('Body:', (page.body || '').substring(0, 500));
  }
}
  const login = await req('POST', '/login', loginData);
  console.log('Login:', login.status);
  if (login.loc) await req('GET', '/');

  const page = await req('GET', '/pusieducation/xinlizixun-shi-quiz/pages');
  console.log('Pages page status:', page.status);

  if (page.body && page.status === 200) {
    let idx = page.body.indexOf('action=');
    console.log('First form index:', idx);
    if (idx >= 0) {
      console.log('Form snippet:', page.body.substring(idx, idx + 500));
    }
    let pagesIdx = page.body.indexOf('Gitee Pages');
    if (pagesIdx < 0) pagesIdx = page.body.indexOf('gitee pages');
    if (pagesIdx < 0) pagesIdx = page.body.indexOf('Pages');
    console.log('Pages text at:', pagesIdx);
    if (pagesIdx >= 0) {
      console.log('Context:', page.body.substring(Math.max(0, pagesIdx - 100), pagesIdx + 200));
    }
    if (page.body.includes('already') && page.body.includes('enabled')) {
      console.log('Pages might already be enabled');
    }
    console.log('Page has csrf:', page.body.includes('_csrf_token'));
    console.log('Page has authenticity_token:', page.body.includes('authenticity_token'));

    const start = page.body.indexOf('<div class=');
    if (start >= 0) {
      console.log('Content start:', page.body.substring(start, start + 1000));
    } else {
      console.log('Page starts:', page.body.substring(0, 1000));
    }
  } else {
    console.log('Status not 200 or no body. Body snippet:', (page.body || '').substring(0, 500));
  }
}

main().catch(e => console.log('Error:', e.message));
