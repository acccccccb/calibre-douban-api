const getData = require('./utils/request');
const index = require('express');
const app = index();
const arguments = process.argv.splice(2);
const params = {};
arguments.forEach(item => {
    const key = item.match(/(?<=-{2})(\S+)(?==)/g)[0];
    const value = item.split('=')[1];
    params[key] = value;
});
const port = params.port ? Number(params.port) : 8085;
const maxResult = params.maxResult ? Number(params.maxResult) : 5;
const intervalTime = params.intervalTime ? Number(params.intervalTime) : 200;

const getDetail = (id) => {
    return getData({
        url: `https://book.douban.com/subject/${id}/`,
        method: 'get',
    }).then((res) => {
        return res;
    });
};
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Content-Type', 'application/json;charset=utf-8');
    next();
});
app.get('/v2/book/search', (req, res) => {
    getData({
        url: `https://www.douban.com/j/search?start=0&cat=1001&q=${req.query.q}`,
        method: 'get',
    }).then((result) => {
        try {
            const books = [];
            let list = JSON.parse(result.body).items || [];

            const loop = (i) => {
                const item = list[i];
                const summary = item.match(/(?<=<p>)(\s|\S)*(?=<\/p>)/);
                const image = item.match(/(?<=<img src=").*(?=")/);
                const title = item.match(/(?<=title=").*(?=" >)/);
                let query = item.match(/(?<=onclick="moreurl\(this,).*(?=\)" title=)/);
                query =
                    Array.isArray(query) && query.length > 0
                        ? JSON.parse(
                              query[0].replace(/,\s*/g, ', "').replace('{', '{"').replace(/:/g, '":').replace(/'/g, '"')
                          )
                        : null;
                query.query = decodeURI(query.query);

                const rating = item.match(/(?<=<span class="rating_nums">).*(?=<\/span>)/);
                let id = item.match(/(?<=sid: ).*(?=, qcat:)/);
                id = Array.isArray(id) ? id[0] : null;
                getDetail(id).then((detail) => {
                    const rep = /(?<=<script type="application\/ld\+json">\s)(\s|\S)*?(?=\s<\/script>)/g;
                    let repMatch = detail.body.match(rep);
                    repMatch = Array.isArray(repMatch) ? JSON.parse(repMatch) : null;

                    const author = repMatch ? repMatch.author.map((mapItem) => decodeURI(mapItem.name || '')) : [];
                    const isbn13 = repMatch ? repMatch.isbn13 : null;
                    const isbn10 = repMatch ? repMatch.isbn10 : null;

                    // let detailBody = detail.body;

                    let translator = detail.body.match(
                        /(?<=<span\s+class="pl">\s?译者<\/span>:\s*)(\s|\S)*?(?=<\/span><br\/>)/g
                    );
                    if (Array.isArray(translator) && translator.length > 0) {
                        translator = translator[0].match(/(?<=<a class="" href="(.*)">).*(?=<\/a>)/g);
                    }

                    let tags = detail.body.match(/(?<=<a\s+class="\s+tag" href="(.*)">)(\s|\S)*?(?=<\/a>)/g);
                    tags = Array.isArray(tags) ? tags.map((tagsItem) => ({ name: tagsItem, title: tagsItem })) : [];

                    let publisher = detail.body.match(/(?<=<span\s+class="pl">出版社:<\/span>)(\s|\S)*?(?=<br\/>)/g);
                    let binding = detail.body.match(/(?<=<span\s+class="pl">装帧:<\/span>)(\s|\S)*?(?=<br\/>)/g);
                    let price = detail.body.match(/(?<=<span\s+class="pl">页数:<\/span>)(\s|\S)*?(?=<br\/>)/g);
                    let pages = detail.body.match(/(?<=<span\s+class="pl">定价:<\/span>)(\s|\S)*?(?=<br\/>)/g);
                    let isbn = detail.body.match(/(?<=<span\s+class="pl">ISBN:<\/span>)(\s|\S)*?(?=<br\/>)/g);
                    let pubdate = detail.body.match(/(?<=<span\s+class="pl">出版年:<\/span>)(\s|\S)*?(?=<br\/>)/g);
                    let origin_title = detail.body.match(/(?<=<span\s+class="pl">原作名:<\/span>)(\s|\S)*?(?=<br\/>)/g);

                    books.push({
                        // repMatch,
                        // detail: detailBody,
                        id,
                        author,
                        translator,
                        tags,
                        isbn13: isbn13,
                        isbn10: isbn10,
                        isbn: Array.isArray(isbn) && isbn.length > 0 ? isbn[0] : '',
                        origin_title: Array.isArray(origin_title) && origin_title.length > 0 ? origin_title[0] : '',
                        pubdate: Array.isArray(pubdate) && pubdate.length > 0 ? pubdate[0] : '',
                        binding: Array.isArray(binding) && binding.length > 0 ? binding[0] : '',
                        price: Array.isArray(price) && price.length > 0 ? price[0] : '',
                        pages: Array.isArray(pages) && pages.length > 0 ? pages[0] : '',
                        publisher: Array.isArray(publisher) && publisher.length > 0 ? publisher[0] : '',
                        title: Array.isArray(title) && title.length > 0 ? title[0] : '',
                        image:
                            Array.isArray(image) && image.length > 0
                                ? image[0].replace('https', 'https://images.weserv.nl/?url=http')
                                : '',
                        url: `https://book.douban.com/subject/${id}/`,
                        summary: Array.isArray(summary) && Array.length > 0 ? summary[0] : '',
                        rating: Array.isArray(rating) && rating.length > 0 ? { average: rating[0] } : { average: '0' },
                        query,
                    });
                    if (i < list.length - 1 && i < maxResult - 1) {
                        i++;
                        setTimeout(() => {
                            loop(i);
                        }, intervalTime);
                    } else {
                        res.send({
                            success: true,
                            message: 'success',
                            books,
                        });
                    }
                });
            };
            if (list.length > 0) {
                loop(0);
            }
        } catch (e) {
            res.send({
                success: false,
                message: e.toString(),
                books: null,
            });
        }
    });
});
app.listen(port, () => {
    console.log(`listening at ${port}`);
});
