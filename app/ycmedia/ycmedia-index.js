import * as qs from "querystring";
import '../../common/js/vendor'

let iframe = document.querySelector('#popup_7')
iframe.onload = () => {
    init()
}

iframe.onreadystatechange = () => {
    console.info(iframe.readyState)
    if (iframe.readyState === 'complete') {
        init()
    }
}

function init() {
    let iw = iframe.contentWindow;
    let id = iw.document

    let investorLSref = iw.$(id.querySelector('#investorLS'))
    let investorDQref = iw.$(id.querySelector('#investorDQ'))

    getData().then(contentList => {
        let investorLS = contentList.filter((ele) => {
            if (ele.disclosureType === '9504') return true;
        })

        let investorDQ = contentList.filter((ele) => {
            if (ele.disclosureType === '9503') return true;
        })

        for (let i = 0; i < investorLS.length; i++) {
            let provi = investorLS[i];
            provi.disclosureTitle = provi.disclosureTitle.replace(/\[临时公告\]/, '');
            provi.disclosurePostTitle=provi.disclosurePostTitle;
            let add = '<li><a target="_blank"  title="' + provi.disclosureTitle + provi.disclosurePostTitle +'" href="http://www.neeq.com.cn' + provi.destFilePath + '">' + provi.disclosureTitle + provi.disclosurePostTitle +'</a><span>' + provi.publishDate + '</span>';
            investorLSref.append(add);
        }
        for (let i = 0; i < investorDQ.length; i++) {
            let provi = investorDQ[i];
            provi.disclosureTitle = provi.disclosureTitle.replace(/\[定期报告\]/, '');
            provi.disclosurePostTitle = provi.disclosurePostTitle;
            let add = '<li><a target="_blank" title="' + provi.disclosureTitle + provi.disclosurePostTitle +'"  href="http://www.neeq.com.cn' + provi.destFilePath + '">' + provi.disclosureTitle + provi.disclosurePostTitle +'</a><span>' + provi.publishDate + '</span>';
            investorDQref.append(add);
        }

        investorDQref.mCustomScrollbar({
            theme: "3d-thick-dark",
            scrollButtons: {enable: false},
        });
        investorLSref.mCustomScrollbar({
            theme: "3d-thick-dark",
            scrollButtons: {enable: false},
        });
    })
}

async function getData() {
    let bo = true;
    let page = 0;

    let list;
    let contentList = [];

    while (bo) {
        let data = await jsonp("http://www.neeq.com.cn/disclosureInfoController/infoResult.do", {
            disclosureType: 5,
            page: page,
            companyCd: 830999,
            isNewThree: 1,
            startTime: '',
            endTime: '',
            keyword: '关键字',
            xxfcbj: '',
        })
        ++page
        if (!data[0].listInfo.content || !data[0].listInfo.content.length) {
            list = data[0].list;
            bo = false;
            return contentList
        }
        contentList.push(...data[0].listInfo.content)
    }
}

let count = 0;

function jsonp(url, body = {}, config = {}, fn) {
    function noop() {
    }

    let target = document.getElementsByTagName('script')[0] || document.head;

    let prefix = config.prefix || 'jsonp';
    let timeout = config.timer || 30000;
    let timer = null;

    let id = config.name || (prefix + (count++) + +new Date());

    body.callback = id;
    body._ = +new Date();

    url += url.indexOf('?') > -1 ? '&' : '?';
    url += qs.stringify(body);

    let script = document.createElement('script');
    script.src = url;
    target.parentNode.insertBefore(script, target);

    function cleanup() {
        if (script.parentNode) script.parentNode.removeChild(script);
        window[id] = noop;
        if (timer) clearTimeout(timer);
    }

    return new Promise((resolve, reject) => {
        window[id] = function (data) {
            resolve(data)
            fn && fn(data);
            cleanup();
        };

        if (timeout) {
            timer = setTimeout(function () {
                reject(new Error('Timeout'));
                timer = 0;
                cleanup();
            }, timeout);
        }
    })
}
