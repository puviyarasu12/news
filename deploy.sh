#!/bin/bash
cd /home/ubuntu/news-platform
git reset --hard
git pull origin main
npm install
pm2 restart all || pm2 start index.js --name news-app
echo "$(date -u) - Deployed new code" >> ~/news-platform/logs/deploy.log
