# calibre-douban-api

从豆瓣获取书籍元数据 配合群晖 calibre-web Docker [johngong/calibre-web](https://hub.docker.com/r/johngong/calibre-web)

# 运行

`npm run start`

# PM2

`pm2 start src/index.js`

# 可选参数

最大显示结果：--maxResult=5

获取每条书籍详情的间隔时间：--intervalTime=200

监听端口：--port=8085

eg: `pm2 start src/index.js --name="calibre-douban-api" --maxResult=5 --intervalTime=200 --port=8085`

# 开发

`npm run dev`

http://your_ip:8085/v2/book/search?q=Node.js
