import '../../common/js/vendor'
import '../../common/css/base.less'
import './css/index.less'
import {getHash} from "../../common/js/util";
import * as qs from "querystring";

hashChange();

window.addEventListener('hashchange', () => {
    hashChange()
});

function hashChange() {
    let refs = Array.from(document.querySelectorAll('[data-contentener]'));
    refs.every(ref => {
        ref.style.display = 'none';
        return true;
    });
    let hash = getHash();
    if (!hash) hash = 'home';
    let ref = refs.find(ref => ref.dataset.type === hash);
    if (ref) {
        ref.style.display = 'block';
        ref.animate([
            {opacity: 0},
            {opacity: 1}
        ], {
            duration: 250
        })
    }
    Array.from(document.querySelector('#filters').children).every(ref => {
        ref.classList.remove('active');
        return true;
    });
    let aRef = document.querySelector(`[href="#${hash}"]`);
    if (aRef) aRef.parentNode.classList.add('active')
}

class BackgroundSwitch {
    ref;
    appoint;
    params;
    bo1 = true;
    bo2 = true;

    constructor(ref, appoint, params = {}) {
        this.ref = ref;
        this.appoint = appoint;
        this.params = params;
        this.init()
        this.initEvent()
    }

    init() {
        this.appoint.style.display = `none`
        this.appoint.style.position = `absolute`
        this.appoint.style.overflow = `hidden`
        this.appoint.style.backgroundRepeat = `no-repeat`
    }

    initEvent() {
        this.ref.addEventListener('mouseout', (event) => {
            this.refMouseout(event)
        })
        this.ref.addEventListener('mousemove', (event) => {
            this.refMousemove(event)
        })
        this.appoint.addEventListener('mouseout', () => {
            this.bo2 = false;
            if (!this.bo1 && !this.bo2) {
                this.appoint.style.display = `none`;
                this.bo1 = true;
                this.bo2 = true;
            }
        })
    }

    refMouseout() {
        this.bo1 = false;
        if (!this.bo1 && !this.bo2) {
            this.appoint.style.display = `none`;
            this.bo1 = true;
            this.bo2 = true;
        }
    }

    refMousemove(event) {
        let ref = event.target;
        let w = ref.clientWidth;
        let h = ref.clientHeight;
        let layerX = event.layerX;
        let layerY = event.layerY;
        let average_w = w / (this.params.rate_x || 1);
        let average_h = h / (this.params.rate_y || 1);
        let x = parseInt(String(layerX / average_w)) + (layerX % average_w ? 1 : 0);
        let y = parseInt(String(layerY / average_h)) + (layerY % average_h ? 1 : 0);

        this.appoint.style.display = `block`;
        this.appoint.style.width = `${average_w}px`;
        this.appoint.style.height = `${average_h}px`;
        this.appoint.style.backgroundSize = `${w}px ${h}px`;
        let xp = (x - 1) * average_w;
        let yp = (y - 1) * average_h;
        this.appoint.style.backgroundPosition = `-${xp}px -${yp}px`;
        this.appoint.style.top = `${yp}px`;
        this.appoint.style.left = `${xp}px`;
    }
}

new BackgroundSwitch(document.querySelector('#huoban1'), document.querySelector('#huoban2'), {
    rate_x: 5,
    rate_y: 2,
});

new BackgroundSwitch(document.querySelector('#adzhu1'), document.querySelector('#adzhu2'), {
    rate_x: 5,
    rate_y: 8,
});

new BackgroundSwitch(document.querySelector('#mediazhu1'), document.querySelector('#mediazhu2'), {
    rate_x: 5,
    rate_y: 11,
});

new BackgroundSwitch(document.querySelector('#agentzy1'), document.querySelector('#agentzy2'), {
    rate_x: 5,
    rate_y: 3,
});


let anlituList = [
    {
        imgli: ['./static/images/anli_tu_1.png']
    },
    {
        imgli: ['./static/images/anli_tu_2.png']
    },
    {
        imgli: ['./static/images/anli_tu_3.png','./static/images/caseimg/case05-01.jpg', './static/images/caseimg/case05-02.jpg']
    },
    {
        imgli: ['./static/images/anli_tu_4.png','./static/images/caseimg/case08-01.jpg', './static/images/caseimg/case08-02.jpg']
    },
    {
        imgli: ['./static/images/anli_tu_5.png','./static/images/caseimg/case02-01.jpg', './static/images/caseimg/case02-02.jpg']
    }
]
/*首页案例轮播*/
/*const head_list = document.getElementById("head_list");
const menu_content = document.getElementById("menu_content");
const oli = head_list.getElementsByTagName("li");//获取tab列表
const odiv = menu_content.querySelector(".imgqh");//获取tab内容列表
for (let i = 0; i < oli.length; i++) {
    oli[i].index = i;//定义index变量，以便让tab按钮和tab内容相互对应
    oli[i].onclick = function () {//移除全部tab样式和tab内容
        for (let i = 0; i < oli.length; i++) {
            oli[i].className = "";
            odiv[i].style.display = "none";
        }
        this.className = "active";//为当前tab添加样式
        odiv[this.index].style.display = "block";//显示当前tab对应的内容


        let data_index = $(this).attr("data-index");
        console.info(data_index)
        anlitu(data_index)
    }
}*/

$('.headimg').on('mouseover', function () {
    let data_index = $(this).attr("data-index");
    anlitu(data_index)
})

function anlitu(index) {
    let html = `
        <div class="imgqh">
            <div class="imgtubox">
                <div class="tulist" data-js-active="img_box">
                    {{imghtml}}
                </div>
            </div>
            <a href="javascript:;" class="prev arrow" data-js-active="img_prev">&lt;</a>
            <a href="javascript:;" class="next arrow" data-js-active="img_next">&gt;</a>
        </div>
    `;

    let imgdata = anlituList[+index];
    console.info(imgdata)
    imgdata.imghtml = imgdata.imgli.map(l => `<img src="${l}"/>`).join('');
    document.querySelector('#menu_content').innerHTML = new Template(html, imgdata).compile();
    new ImgLoop(document.querySelector('[data-js-active=img_box]'), document.querySelector('[data-js-active=img_next]'),document.querySelector('[data-js-active=img_prev]'),{
        imgWidth: 254,
        imgHeight: 494,
    })
}


/*业务版块*/
let scrol = document.querySelector("#contentener");
let offSet = $('#guangcheng').offset().top;
scrol && scrol.addEventListener('scroll', function () {
    let t = scrol.scrollTop;
    if (t > offSet) {
        $('.img1').addClass('animat1')
        $('.img2').addClass('animat2')
        $('.img3').addClass('animat3')
        $('.img4').addClass('animat4')
        $('.img5').addClass('animat5')
    }
})


/*关于银橙*/
const aboutRef = document.querySelector("#about_menu");
const aboutListRef = document.querySelector("#aboutlist");

aboutRef.addEventListener('click', (e) => {
    let fRef = null;
    Array.from(aboutRef.children).forEach(f => {
        f.classList.remove('active')
        if (f.contains(e.target)) {
            f.classList.add('active')
            fRef = f
        }
    })
    if (fRef && aboutListRef) {
        let type = fRef.dataset.type;
        if (+type) {
            Array.from(aboutListRef.children).forEach(p => {
                p.style.display = 'none';
                if (p.dataset.type == type) {
                    p.style.display = 'block';
                    p.animate([
                        {opacity: 0},
                        {opacity: 1}
                    ], {
                        duration: 500
                    })
                }
            })
        }
    }
});


/*关于银橙 招兵买马*/
function navList(id) {
    let $obj = $("#nav_dot"), $item = $("#J_nav_" + id);
    $item.addClass("on").parent().removeClass("none").parent().addClass("selected");
    $obj.find(".recommend").hover(function () {
        $(this).addClass("hover");
    }, function () {
        $(this).removeClass("hover");
    });
    $obj.find("p").hover(function () {
        if ($(this).hasClass("on")) {
            return;
        }
        $(this).addClass("hover");
    }, function () {
        if ($(this).hasClass("on")) {
            return;
        }
        $(this).removeClass("hover");
    });
    $obj.find(".recommend").click(function () {
        let $div = $(this).siblings(".list-item");
        if ($(this).parent().hasClass("selected")) {
            $div.slideUp(600);
            $(this).parent().removeClass("selected");
        }
        if ($div.is(":hidden")) {
            $("#nav_dot li").find(".list-item").slideUp(200);
            $("#nav_dot li").removeClass("selected");
            $(this).parent().addClass("selected");
            $div.slideDown(200);

        } else {
            $div.slideUp(100);
        }
    });
}

navList(1);

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

/*投资者关系
*
*
* page默认第一页
* 改变page值获取对应页码的值
* */
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

!function () {
    let investorLSref = document.querySelector('#investorLS');
    let investorDQref = document.querySelector('#investorDQ');

    getData().then(contentList => {
        let investorLS = contentList.filter((ele) => {
            if (ele.disclosureType === '9504') return true;
        })

        let investorDQ = contentList.filter((ele) => {
            if (ele.disclosureType === '9503') return true;
        })

        let investorLSHtml = ''
        for (let i = 0; i < investorLS.length; i++) {
            let provi = investorLS[i];
            provi.disclosureTitle = provi.disclosureTitle.replace(/\[临时公告\]/, '');
            provi.disclosurePostTitle = provi.disclosurePostTitle;
            let add = '<li><a target="_blank"  title="' + provi.disclosureTitle + provi.disclosurePostTitle + '" href="http://www.neeq.com.cn' + provi.destFilePath + '">' + provi.disclosureTitle + provi.disclosurePostTitle + '</a><span>' + provi.publishDate + '</span>';
            investorLSHtml += add
        }
        investorLSref.innerHTML = investorLSHtml
        let investorDQHtml = ''
        for (let i = 0; i < investorDQ.length; i++) {
            let provi = investorDQ[i];
            provi.disclosureTitle = provi.disclosureTitle.replace(/\[定期报告\]/, '');
            provi.disclosurePostTitle = provi.disclosurePostTitle;
            let add = '<li><a target="_blank" title="' + provi.disclosureTitle + provi.disclosurePostTitle + '"  href="http://www.neeq.com.cn' + provi.destFilePath + '">' + provi.disclosureTitle + provi.disclosurePostTitle + '</a><span>' + provi.publishDate + '</span>';
            investorDQHtml += add
        }
        investorDQref.innerHTML = investorDQHtml
    });
}()


/*
* 模板编译
* */
class Template {
    html
    value
    reg = /\{\{((?:.|\n)+?)\}\}/

    constructor(html, value) {
        this.html = html;
        this.value = value;
    }

    compileFun(exg) {
        let fun = new Function('vm', `
            with(vm){return eval("${exg.replace(/'/g, '\\\'').replace(/"/g, '\\\"')}")}
        `);
        return fun(this.value);
    }

    compile() {
        this.html.match(new RegExp(this.reg, 'ig')).every(va => {
            this.html.replace(va, value => {
                let t = value.match(this.reg)
                let a = t[1].replace(/\s/ig, '').replace(/\s*(\.)\s*/, '.')
                let val = this.isBooleanValue(this.compileFun(a));
                this.html = this.html.replace(t[0], val)
            })
            return true;
        })
        return this.html;
    }

    isBooleanValue(val) {
        switch (val) {
            case true:
                return String(true);
            case false:
                return String(false);
            case null:
                return String();
            case void 0:
                return String();
            default:
                return String(val)
        }
    }
}


let list = [
    {
        img: './static/images/caseimg/tu1701.jpg',
        title: '光荣使命',
        type: '游戏类',
        cost: '0.50 元',
        activation: '6.00 元',
        rate:'',
        imglist: ['./static/images/caseimg/case01-01.png'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1702.jpg',
        title: '荒野行动',
        type: '游戏类',
        cost: '0.68 元',
        activation: '4.00 元',
        rate: '3%',
        imglist: ['./static/images/caseimg/case02-01.jpg', './static/images/caseimg/case02-02.jpg', './static/images/caseimg/case02-03.png'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1703.jpg',
        title: '最强NBA',
        type: '游戏类',
        cost: '0.40 元',
        activation: '5.00 元',
        rate: '',
        imglist: ['./static/images/caseimg/case03-01.png'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1704.jpg',
        title: '唯品会',
        type: '电商类',
        cost: '0.70 元',
        activation: '',
        rate: '2.20%',
        imglist: ['./static/images/caseimg/case04-01.png'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1705.jpg',
        title: '网易严选',
        type: '电商类',
        cost: '0.58 元',
        activation: '',
        rate: '',
        imglist: ['./static/images/caseimg/case05-01.jpg', './static/images/caseimg/case05-02.jpg', './static/images/caseimg/case05-03.jpg'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1706.jpg',
        title: '闪电降价',
        type: '电商类',
        cost: '0.60 元',
        activation: '',
        rate: '3.00%',
        imglist: ['./static/images/caseimg/case06-01.png'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1707.jpg',
        title: '你我贷',
        type: '金融类',
        cost: '0.3 - 0.5元',
        activation: '',
        rate: '3% - 5%',
        imglist: ['./static/images/caseimg/case07-01.jpg', './static/images/caseimg/case07-02.jpg', './static/images/caseimg/case07-03.jpg'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1708.jpg',
        title: '拍拍贷',
        type: '金融类',
        cost: '0.40 元',
        activation: '',
        rate: '2.50 %',
        imglist: ['./static/images/caseimg/case08-01.jpg', './static/images/caseimg/case08-02.jpg'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1709.jpg',
        title: '交通银行',
        type: '金融类',
        cost: '0.70 元',
        activation: '16.00 元',
        rate: '3.00 %',
        imglist: ['./static/images/caseimg/case09-01.png'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1710.jpg',
        title: '每日优鲜',
        type: '网服类',
        cost: '0.76元',
        activation: '6.00 元',
        rate: '1.33%',
        imglist: ['./static/images/caseimg/case10-01.jpg', './static/images/caseimg/case10-02.jpg'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1711.jpg',
        title: '搜狗搜索',
        type: '网服类',
        cost: '0.76元',
        activation: '4.00 元',
        rate: '',
        imglist: ['./static/images/caseimg/case11-01.png'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1712.jpg',
        title: 'UC浏览器',
        type: '工具类',
        cost: '0.56 元',
        activation: '5.00 元',
        rate: '8.00 %',
        imglist: ['./static/images/caseimg/case12-01.jpg', './static/images/caseimg/case12-02.jpg','./static/images/caseimg/case12-03.jpg'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1713.jpg',
        title: '天天快报',
        type: '工具类',
        cost: '0.70 元',
        activation: '8.00 元',
        rate: '6.00 %',
        imglist: ['./static/images/caseimg/case13-01.png'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1714.jpg',
        title: '火山小视频',
        type: '工具类',
        cost: '0.55 元',
        activation: '6.00 元',
        rate: '10.00%',
        imglist: ['./static/images/caseimg/case14-01.png'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1715.jpg',
        title: '大众点评',
        type: '工具类',
        cost: '0.55 元',
        activation: '6.00 元',
        rate: '10.00%',
        imglist: ['./static/images/caseimg/tu1715.jpg'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1716.jpg',
        title: 'KEEP',
        type: '工具类',
        cost: '0.70',
        activation: '8.00',
        rate: '6.00%',
        imglist: ['', '', ''],
        time: '2017年',
        target: '营销目标：',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1717.jpg',
        title: 'VIPKID',
        type: '工具类',
        cost: '0.70',
        activation: '8.00',
        rate: '6.00%',
        imglist: ['', '', ''],
        time: '2017年',
        target: '营销目标：',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1718.jpg',
        title: '交大成人教育',
        type: '工具类',
        cost: '0.70',
        activation: '8.00',
        rate: '6.00%',
        imglist: ['', '', ''],
        time: '2017年',
        target: '营销目标：',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1719.jpg',
        title: '网易考拉',
        type: '工具类',
        cost: '0.70',
        activation: '8.00',
        rate: '6.00%',
        imglist: ['', '', ''],
        time: '2017年',
        target: '营销目标：',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/tu1720.jpg',
        title: 'JJ斗地主',
        type: '工具类',
        cost: '0.70',
        activation: '8.00',
        rate: '6.00%',
        imglist: ['', '', ''],
        time: '2017年',
        target: '营销目标：',
        platform: '智橙移动端'
    },
]

~function () {
    let str = `
        <div class="yccm_client_case_group" data-index="{{$index}}">
            <p class="img"><img src="{{img}}"></p>
            <div class="yccm_client_case_text">{{title}}</div>
            <p class="yccm_client_case_timetext"><span>客户类型：{{type}}</span><span>CPC成本：{{cost}}</span></p>
            <p class="yccm_client_case_timetext"><span>激活成本：{{activation}}</span><span>点击率：{{rate}}</span></p>
            <a href="javascript:void(0);" class="link">查看详情&nbsp;&gt;</a>
        </div>
    `;

    let caseList = [];
    list.forEach((l, i) => {
        l.$index = i;
        caseList += new Template(str, l).compile();
    })
    document.querySelector('.yccm_popup_bodyText').innerHTML = caseList;

}()


$('.yccm_client_case_group').on('click', function () {
    let data_index = $(this).attr("data-index");
    Details(data_index)
})


function Details(index) {
    let html = `
        <div class="yccm_client_details clear">
            <div class="yccm_client_details_left">
                <div class="imgtubox">
                    <div class="tulist" data-js-active="img_box">
                        {{imghtml}}
                    </div>
                </div>
                <a href="javascript:;" class="prev arrow" data-js-active="img_prev">&lt;</a>
                <a href="javascript:;" class="next arrow" data-js-active="img_next">&gt;</a>
            </div>
            <div class="yccm_client_details_right">
                <h2 class="title">{{title}}<span>案例时间：{{time}}</span></h2>
                <p class="text">
                    {{target}}
                </p>
                <ul class="features">
                    <li>案例类型：{{type}}</li>
                    <li>投放平台：{{platform}}</li>
                    <li>CPC成本：{{cost}}</li>
                    <li class="baizi">激活成本：{{activation}}</li>
                    <li>点击率：{{rate}}</li>
                </ul>
                <div class="btn_box">
                    <a href="javascript:;" class="kongbtn" data-js-active="next">下一个案例</a>
                    <a href="javascript:;" class="previous" data-js-active="prev">上一个</a>
                </div>
            </div>
        </div>
    `;
    let data = list[+index];
    data.imghtml = data.imglist.map(l => `<img src="${l}"/>`).join('')
    document.querySelector('.yccm_popup_body').innerHTML = '';
    document.querySelector('.yccm_popup_body').innerHTML = new Template(html, data).compile();
    layer.open({
        type: 1,
        shade: 0,
        area: ['100%', '100%'], //宽高
        title: false,
        content: $('#popup'),
    });
    document.querySelector('[data-js-active=next]').onclick = () => {
        if (list.length <= data.$index + 1) {
            Details(0)
        } else {
            Details(data.$index + 1)
        }
    }
    document.querySelector('[data-js-active=prev]').onclick = () => {
        if (data.$index - 1 < 0) {
            Details(list.length - 1)
        } else {
            Details(data.$index - 1)
        }
    }

    new ImgLoop(document.querySelector('[data-js-active=img_box]'), document.querySelector('[data-js-active=img_next]'),document.querySelector('[data-js-active=img_prev]'),{
        imgWidth: 254,
        imgHeight: 494,
    })
}

//图片循环
class ImgLoop {
    boxRef
    nextRef
    prevRef
    params
    boxWidth

    constructor(boxRef, nextRef, prevRef, params = {}) {
        this.boxRef = boxRef;
        this.nextRef = nextRef;
        this.prevRef = prevRef;
        this.params = params;
        this.init()
        console.info('init')
    }

    init() {
        let length = this.boxRef.children.length;
        this.boxWidth = this.params.imgWidth * length;
        this.boxRef.style.width = `${this.boxWidth}px`;
        this.boxRef.style.height = `${this.params.imgHeight}px`;
        this.boxRef.style.left = `0px`;
        this.boxRef.style.transition = `left 0.3s`;

        this.nextRef.onclick = () => {
            this.next()
        };
        this.prevRef.onclick = () => {
            this.prev()
        }
    }

    start() {

    }

    stop() {

    }

    next() {
        let left = this.boxRef.style.left.replace(/px$/,'');
        left = Math.abs(left) + this.params.imgWidth
        if(Math.abs(left) > this.boxWidth - this.params.imgWidth){
            left = 0
        }
        this.boxRef.style.left = `-${left}px`
    }

    prev() {
        let left = this.boxRef.style.left.replace(/px$/,'');
        left = Math.abs(left) - this.params.imgWidth;
        if(left < 0){
            left = this.boxWidth - this.params.imgWidth;
        }
        this.boxRef.style.left = `-${left}px`
    }

    go() {

    }
}

