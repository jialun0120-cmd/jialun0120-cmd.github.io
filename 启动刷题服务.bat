@echo off
title 心理咨询师刷题服务
cd /d "%~dp0"
echo ========================================
echo    心理咨询师刷题服务启动中...
echo ========================================
echo.
echo 公开链接: https://mighty-parks-design.loca.lt/心理咨询师考试.html
echo.
echo 按 Ctrl+C 关闭服务
echo ========================================
npx --yes localtunnel --port 18925
