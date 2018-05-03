import '../../common/js/vendor'
import '../../common/css/base.less'
import './css/index.less'
import {getHash} from "../../common/js/util";
import * as qs from "querystring";

hashChange();

window.addEventListener('hashchange', () => {
    hashChange()
});

function init() {
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

function hashChange() {
    init();
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

new BackgroundSwitch(document.querySelector('#huob1'), document.querySelector('#huob2'), {
    rate_x: 5,
    rate_y: 8,
});

/**/

const head_list = document.getElementById("head_list");
const menu_content = document.getElementById("menu_content");
const oli = head_list.getElementsByTagName("li");//获取tab列表
const odiv = menu_content.getElementsByTagName("div");//获取tab内容列表
for (let i = 0; i < oli.length; i++) {
    oli[i].index = i;//定义index变量，以便让tab按钮和tab内容相互对应
    oli[i].onclick = function () {//移除全部tab样式和tab内容
        for (let i = 0; i < oli.length; i++) {
            oli[i].className = "";
            odiv[i].style.display = "none";
        }
        this.className = "active";//为当前tab添加样式
        odiv[this.index].style.display = "block";//显示当前tab对应的内容
    }
}

/*业务版块*/
let scrol = document.querySelector("#contentener");
let offSet = $('#guangcheng').offset().top;
// console.info(offSet);
scrol && scrol.addEventListener('scroll', function () {
    let t = scrol.scrollTop;
    // console.info(t);
    if (t > offSet) {
        $('.img1').addClass('animat1')
        $('.img2').addClass('animat2')
        $('.img3').addClass('animat3')
        $('.img4').addClass('animat4')
        $('.img5').addClass('animat5')
    }
})

/*案例中心*/
$('.yccm_client_case_group').on('click', function () {

    let hrefa = $(this).attr("data-href");
    let obj = "../static/client_details/" + hrefa + '?_=' + Date.now();
    $(document.body).innerHeight()
    let width = $(document.body).outerWidth();
    layer.open({
        type: 2,
        title: false,
        shadeClose: true,
        shade: 0.9,
        area: [width + 'px', '100%'],
        content: obj //iframe的url
    });
});

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
async function getData(page = 0) {
    return await jsonp("http://www.neeq.com.cn/disclosureInfoController/infoResult.do", {
        disclosureType: 5,
        page: page,
        companyCd: 830999,
        isNewThree: 1,
        startTime: '',
        endTime: '',
        keyword: '关键字',
        xxfcbj: '',
    })
}

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

/*let html = '{{asd}}123{{zxc}}456{{qwe}}78{{aa.bb}}9';
let value = {
    asd: 'asd',
    zxc: 'zxc',
    qwe: 'qwe',
    aa: {bb: 'bb'}
};
let val = new Template(html, value).compile()
console.info(val);*/


let str = `
<div class="yccm_client_case_group" data-index="{{$index}}">
    <p class="img"><img src="{{img}}"></p>
    <div class="yccm_client_case_text">{{title}}</div>
    <p class="yccm_client_case_timetext"><span>客户类型：{{type}}</span><span>CPC成本：{{cost}}</span></p>
    <p class="yccm_client_case_timetext"><span>激活成本：{{activation}}</span><span>点击率：{{rate}}</span></p>
</div>
`;

let html = `
    <div class="yccm_client_details clear" data-index="{{$index}}">
        <div class="yccm_client_details_left">
            <div class="imgtubox">
                <div class="tulist" style="left: -254px;">
                    
                </div>
            </div>
            <a href="javascript:;" class="prev" class="arrow">&lt;</a>
            <a href="javascript:;" class="next" class="arrow">&gt;</a>
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
                <a href="javascript:;" class="kongbtn">下一个案例</a>
                <a href="javascript:;" class="previous">上一个</a>
            </div>
        </div>
    </div>
`;

let list = [
    {
        img: './static/images/caseimg/case09.jpg',
        title: '光荣使命',
        type: '工具类',
        cost: '0.70',
        activation: '8.00',
        rate: '6.0%',
        imglist: ['./static/images/caseimg/case01-01.jpg', './static/images/caseimg/case01-02.jpg'],
        time: '2017年',
        target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息，有效提升精准度和转化效果，为品牌带来更多有效用户。',
        platform: '智橙移动端'
    },
    {
        img: './static/images/caseimg/case02.jpg',
        title: '荒野行动',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['./static/images/caseimg/case02-01.jpg', './static/images/caseimg/case02-02.jpg', './static/images/caseimg/case02-03.jpg'],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case09.jpg',
        title: '最强NBA',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case09.jpg',
        title: '唯品会',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case04.jpg',
        title: '网易严选',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case09.jpg',
        title: '闪电降价',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case09.jpg',
        title: '你我贷',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case01.jpg',
        title: '拍拍贷',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case09.jpg',
        title: '交通银行',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case09.jpg',
        title: '每日优鲜',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case09.jpg',
        title: '搜狗搜索',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case09.jpg',
        title: 'UC浏览器',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case09.jpg',
        title: '天天快报',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case09.jpg',
        title: '火山小视频',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case05.jpg',
        title: '大众点评',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case03.jpg',
        title: 'KEEP',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case06.jpg',
        title: 'VIPKID',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case07.jpg',
        title: '交大成人教育',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case08.jpg',
        title: '网易考拉',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
    {
        img: './static/images/caseimg/case09.jpg',
        title: 'JJ斗地主',
        type: '工具类',
        cost: '',
        activation: '',
        rate: '',
        imglist: ['', '', ''],
        time: '',
        target: '',
        platform: ''
    },
]
let caseList = [];
list.forEach((l,i) => {
    l.$index = i;
    caseList += new Template(str, l).compile();
})
document.querySelector('.yccm_popup_bodyText').innerHTML = caseList;


$('.yccm_client_case_group').on('click', function () {
    let popup = document.querySelector('#popup').innerHTML;
    let data_index = $(this).attr("data-index");
    // console.info(htmlindex)
    layer.open({
        type: 1,
        area: ['100%', '100%'], //宽高
        title: false,
        content: popup,
        success: () => {
            console.info(list[data_index]);
            let htmlStr = new Template(html, list[data_index]).compile();
            document.querySelector('.yccm_popup_body').innerHTML = htmlStr;



            // let htmlList = [];
            // list.forEach((l,i) => {
            //     l.$index = i;
            //     htmlList += new Template(html, l).compile();
            // })
            //
            // let htmllists =document.querySelector('.yccm_popup_body')
            //
            // Array.from(htmllists.children).forEach(f => {
            //     console.info(f)
            // })
            // // let htmllists =document.querySelector('.yccm_popup_body').children;
            //
            // console.info(htmllists[dataindex])
            // if(dataindex && htmllists[dataindex]){
            //     // document.querySelector('.yccm_popup_body').innerHTML = htmlindex[dataindex]
            //     // htmlList[dataindex].style.display='block';
            // }
        }
    });
})

/*const aboutRef = document.querySelector("#about_menu");
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
});*/



/*var imgbox = document.querySelector('.imgtubox');
var list1 = document.querySelector('.tulist');
var prev = document.querySelector('.prev');
var next = document.querySelector('.next');
var index = 1;
var timer;
function animate(offset) {
    //获取的是style.left，是相对左边获取距离，所以第一张图后style.left都为负值，
    //且style.left获取的是字符串，需要用parseInt()取整转化为数字。
    var newLeft = parseInt(list1.style.left) + offset;
    list1.style.left = newLeft + 'px';
    //无限滚动判断
    if (newLeft > -254) {
        list1.style.left = -1270 + 'px';
    }
    if (newLeft < -1270) {
        list1.style.left = -254 + 'px';
    }
}
function play() {
    //重复执行的定时器
    timer = setInterval(function() {
        next.onclick();
    }, 2000)
}

function stop() {
    clearInterval(timer);
}
prev.onclick = function() {
    index -= 1;
    if (index < 1) {
        index = 5
    }
    animate(254);
};

next.onclick = function() {
    //由于上边定时器的作用，index会一直递增下去，我们只有5个小圆点，所以需要做出判断
    index += 1;
    if (index > 5) {
        index = 1
    }
    animate(-254);
};
imgbox.onmouseover = stop;
imgbox.onmouseout = play;
play();*/




