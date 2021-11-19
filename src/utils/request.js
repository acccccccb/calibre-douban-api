const got = require('got');
// const { decode } = require('html-entities');

function getData(
    params = {
        url: null,
        method: 'POST',
        body: null,
    }
) {
    // console.log(params.method, params.url);
    const headersArr = [
        // {
        //     name: 'Host',
        //     value: 'search.douban.com',
        // },
        {
            name: 'Connection',
            value: 'keep-alive',
        },
        {
            name: 'Pragma',
            value: 'no-cache',
        },
        {
            name: 'Cache-Control',
            value: 'no-cache',
        },
        {
            name: 'Upgrade-Insecure-Requests',
            value: '1',
        },
        {
            name: 'User-Agent',
            value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
        },
        {
            name: 'Accept',
            value: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        },
        {
            name: 'Accept-Encoding',
            value: 'gzip, deflate',
        },
        {
            name: 'Accept-Language',
            value: 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        {
            name: 'Cookie',
            value: 'bid=OLQAA_wwA8k; douban-fav-remind=1; viewed="34769292"; gr_user_id=4cea3a35-e9db-4e25-bf51-b8348048509d; __utma=30149280.1048994135.1620725249.1620725249.1628041438.2; __utmz=30149280.1628041438.2.2.utmcsr=baidu|utmccn=(organic)|utmcmd=organic',
        },
    ];
    const headers = {};
    headersArr.forEach((item) => {
        let name = item.name;
        if (item.name.indexOf(':') === 0) {
            name = name.replace(':', '');
        }
        headers[name] = item.value;
    });
    delete headers['content-length'];
    return new Promise((resolve, reject) => {
        (async () => {
            // const payload = params.body;
            // payload.timestamp = new Date().getTime();
            let response = await got(params.url, {
                method: params.method,
                headers,
                // body: JSON.stringify(payload),
            });
            // console.log(response.statusCode);
            if (response.statusCode === 200) {
                resolve(response);
            } else {
                reject(response);
            }
        })();
    });
}

module.exports = getData;
