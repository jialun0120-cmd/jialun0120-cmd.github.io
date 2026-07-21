const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
 
const PORT = 18925;
const DIR = path.join(__dirname);
const SUBDOMAIN = 'xlzx-psych' + Math.random().toString(36).slice(2,6);

const MIME = {
  '.html': 'text/html;charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let f = req.url === '/' || req.url === '/index.html' ? 'quiz-psych.html' : decodeURIComponent(req.url.slice(1));
  let fp = path.join(DIR, f);
  let ext = path.extname(fp);
  fs.readFile(fp, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type':'text/plain;charset=utf-8'});
      res.end('未找到文件');
      return;
    }
    res.writeHead(200, {'Content-Type': MIME[ext] || 'application/octet-stream'});
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('✓ 本地服务器已启动: http://localhost:' + PORT);
  console.log('  正在创建公开隧道...');
 
  const lt = spawn('npx.cmd', ['--yes', 'localtunnel', '--port', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });
 
  lt.stdout.on('data', (data) => {
    const text = data.toString();
    console.log(text.trim());
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      const base = urlMatch[0].replace(/\/$/, '');
      const fullUrl = base + '/\u5fc3\u7406\u54a8\u8be2\u5e08\u8003\u8bd5.html';
      console.log('\n==============================');
      console.log('✅ 刷题页面已上线！');
      console.log('\u2605 \u56fd\u5bb6\u5fc3\u7406\u5065\u5eb7\u7f51\u00b7\u5fc3\u7406\u54a8\u8be2\u5e08\u8003\u8bd5:');
      console.log('   ' + fullUrl);
      console.log('\u2605 \u5fc3\u7406\u5b66\u54a8\u8be2\u5e08\u5237\u9898: ' + base + '/\u5fc3\u7406\u5b66\u54a8\u8be2\u5e08-\u5237\u9898.html');
      console.log('\u2605 AIGC\u5e94\u7528\u5de5\u7a0b\u5e08\u9898\u5e93: ' + base + '/\u5de5\u4fe1\u90e8\u6559\u8003\u4e2d\u5fc3-AIGC\u5e94\u7528\u5de5\u7a0b\u5e08\u9898\u5e93.html');
      console.log('==============================\n');
      // Save URL for easy reference
      fs.writeFileSync(path.join(DIR, 'tunnel-url.txt'), fullUrl);
      // Also create/update the batch file
      const batPath = path.join(DIR, '启动刷题服务.bat');
      const batContent = `@echo off
title 心理咨询师刷题服务
cd /d "%~dp0"
echo ========================================
echo    心理咨询师刷题服务启动中...
echo ========================================
echo.
echo 公开链接: ${fullUrl}
echo.
echo 按 Ctrl+C 关闭服务
echo ========================================
npx --yes localtunnel --port ${PORT}
`;
      fs.writeFileSync(batPath, batContent);
    }
  });
 
  lt.stderr.on('data', (data) => {
    console.error(data.toString().trim());
  });
 
  lt.on('exit', (code) => {
    console.log('隧道已关闭 (exit code: ' + code + ')');
    server.close();
  });
});
 
process.on('SIGINT', () => { console.log('\n正在关闭服务...'); server.close(); process.exit(); });
process.on('SIGTERM', () => { console.log('\n正在关闭服务...'); server.close(); process.exit(); });
