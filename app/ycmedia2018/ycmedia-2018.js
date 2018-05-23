import '../../common/js/vendor'
import '../../common/css/base.less'
import './css/index.less'
import {getHash} from "../../common/js/util";
import * as qs from "querystring";

hashChange();
window.addEventListener('hashchange', () => {
    hashChange()
});

function startOP(obj, utarget) {
    let speed = 0;
    clearInterval(obj.timer);//先关闭定时器
    obj.timer = setInterval(function () {
        if (obj.alpha > utarget) {
            speed = -10;
        } else {
            speed = 10;
        }
        obj.alpha = obj.alpha + speed;
        if (obj.alpha == utarget) {
            clearInterval(obj.timer);
        }
        obj.style.filter = 'alpha(opacity:' + obj.alpha + ')';//基于IE的
        obj.style.opacity = parseInt(obj.alpha) / 100;
    }, 30);
}

function hashChange() {
    let refs = Array.from(document.querySelectorAll('[data-contentener]'));
    refs.every(ref => {
        ref.style.display = 'none';
        return true;
    });
    let hash = getHash();
    if (!hash) hash = 'home';
    let ref = refs.find(ref => ref.dataset.type === hash);
    ref.timer = null;//事先定义
    ref.alpha = 0;//事先定义
    if (ref) {
        startOP(ref, 100);
        ref.style.display = 'block';
        document.querySelector('.scroll-content').scrollTop = 0
    }
    Array.from(document.querySelector('#filters').children).every(ref => {
        ref.classList.remove('active');
        return true;
    });
    let aRef = document.querySelector(`[href="#${hash}"]`);
    if (aRef) aRef.parentNode.classList.add('active')

    let scrol = document.querySelector('.scroll-content');
    let top_nav_ref = document.querySelector('.top_nav')
    if (hash != 'home') {
        top_nav_ref.style.background = 'url("../static/images/nav_bg.jpg") no-repeat';
        top_nav_ref.style.backgroundSize = '100% 100%';
    } else {
        top_nav_ref.style.background = 'none';
    }
    scrol && scrol.addEventListener('scroll', function () {
        top_nav_ref.style.top = scrol.scrollTop + 'px';
        if (hash != 'home') {
            let top_nav_ref = document.querySelector('.top_nav')
            top_nav_ref.style.background = 'url("../static/images/nav_bg.jpg") no-repeat';
            top_nav_ref.style.backgroundSize = '100% 100%';
        } else {
            if (scrol.scrollTop > 60) {
                top_nav_ref.style.background = 'url("../static/images/nav_bg.jpg") no-repeat';
                top_nav_ref.style.backgroundSize = '100% 100%';
            } else {
                top_nav_ref.style.background = 'none';
            }
        }
    })
}
if (document.documentElement.clientWidth <= 1200) {
    document.querySelector('.scroll-content').style.overflowX = 'auto'
    document.querySelector('.footer').style.marginBottom = '10px'
} else {
    document.querySelector('.footer').style.marginBottom = '0'
    document.querySelector('.scroll-content').style.overflowX = 'hidden'
}
window.onresize = function () {
    if (document.documentElement.clientWidth <= 1200) {
        document.querySelector('.scroll-content').style.overflowX = 'auto'
        document.querySelector('.footer').style.marginBottom = '10px'
    } else {
        document.querySelector('.footer').style.marginBottom = '0'
        document.querySelector('.scroll-content').style.overflowX = 'hidden'
    }
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
            with(vm){try {return eval("${exg.replace(/'/g, '\\\'').replace(/"/g, '\\\"')}")}catch (e) {return ''}}
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

//图片循环
class ImgLoop {
    boxRef
    nextRef
    prevRef
    params
    boxWidth
    defaultParams = {
        time: 1500,
        nextRef: null,
        prevRef: null,
    }
    state = 0;//0 初始状态 1开始轮播状态 2被操作状态
    num = 0

    constructor(boxRef, params = {}) {
        this.boxRef = boxRef;
        this.nextRef = params.nextRef;
        this.prevRef = params.prevRef;
        Object.assign(this.defaultParams, params)
        this.params = params;
        Object.assign(this.params, this.defaultParams)
        this.init()
    }

    init() {
        let length = this.boxRef.children.length;
        this.boxWidth = this.params.imgWidth * length;
        this.boxRef.style.width = `${this.boxWidth}px`;
        this.boxRef.style.height = `${this.params.imgHeight}px`;
        this.boxRef.style.left = `0px`;
        this.boxRef.style.transition = `left 0.3s`;
        this.boxRef.style.MozTransform = `left 0.3s`;
        this.boxRef.style.webkitTransition = `left 0.3s`;
        if (this.nextRef) {
            this.nextRef.onclick = () => {
                this.next()
            };
        }
        if (this.prevRef) {
            this.prevRef.onclick = () => {
                this.prev()
            }
        }
    }

    sleep(time) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, time);
        })
    }

    async start() {
        if(this.state === 1) return;
        ++this.num
        this.state = 1;
        while (this.state >= 1 && document.body.contains(this.boxRef)) {
            this.state = 1;
            let num = this.num;
            await this.sleep(this.params.time);
            this.state === 1 && num === this.num && this.next()
        }
    }

    stop() {
        ++this.num
        this.state = 0;
    }

    next() {
        this.state = 2;
        ++this.num
        let left = this.boxRef.style.left.replace(/px$/, '');
        left = Math.abs(left) + this.params.imgWidth
        if (Math.abs(left) > this.boxWidth - this.params.imgWidth) {
            left = 0
        }
        this.boxRef.style.left = `-${left}px`
        this.params.callback && this.params.callback(left / this.params.imgWidth)
    }

    prev() {
        this.state = 2;
        ++this.num
        let left = this.boxRef.style.left.replace(/px$/, '');
        left = Math.abs(left) - this.params.imgWidth;
        if (left < 0) {
            left = this.boxWidth - this.params.imgWidth;
        }
        this.boxRef.style.left = `-${left}px`
    }

    go(index) {
        this.stop();
        let left = this.params.imgWidth * (index + 1);
        if (left > this.boxWidth) {
            left = this.boxWidth
        }
        if (left < 0) {
            left = this.params.imgWidth
        }
        this.boxRef.style.left = `-${left - this.params.imgWidth}px`
    }
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

!function () {
    let anlituList = [
        {
            imgli: ['./static/images/anli_tu_1_01.png']
        },
        {
            imgli: ['./static/images/anli_tu_2_01.png']
        },
        {
            imgli: ['./static/images/anli_tu_3_01.png', './static/images/caseimg/case05-01.jpg', './static/images/caseimg/case05-02.jpg']
        },
        {
            imgli: ['./static/images/anli_tu_4_01.png', './static/images/caseimg/case08-01.jpg', './static/images/caseimg/case08-02.jpg']
        },
        {
            imgli: ['./static/images/anli_tu_5_01.png', './static/images/caseimg/case02-01.jpg', './static/images/caseimg/case02-02.jpg']
        }
    ]

    $('.headimg').on('mouseover', function () {
        let data_index = $(this).attr("data-index");
        anlitu(data_index)
    })

    function anlitu(index) {
        let html1 = `
        <div class="imgqh">
            <div class="imgtubox">
                <div class="tulist" data-js-active="img_box1">
                    {{imghtm}}
                </div>
            </div>
            <a href="javascript:;" class="prev arrow" data-js-active="img_prev1">&lt;</a>
            <a href="javascript:;" class="next arrow" data-js-active="img_next1">&gt;</a>
        </div>
    `;
        let imgdata = anlituList[+index];
        imgdata.imghtm = imgdata.imgli.map(l => `<img src="${l}"/>`).join('');
        document.querySelector('#menu_content').innerHTML = new Template(html1, imgdata).compile();
        new ImgLoop(document.querySelector('[data-js-active=img_box1]'), {
            imgWidth: 224,
            imgHeight: 395,
            nextRef: document.querySelector('[data-js-active=img_next1]'),
            prevRef: document.querySelector('[data-js-active=img_prev1]'),
        }).start().catch(e => console.error(e))
    }

    anlitu(0)
}()
// 首页业务
!function () {
    function yewu(index) {
        let yewulit = ['./static/images/1.jpg', './static/images/2.jpg', './static/images/3.jpg', './static/images/4.jpg',]
        document.querySelector('#pic').innerHTML = yewulit.map(l => `<img src="${l}"/>`).join('');
    }

    yewu(0)
    let imgLoop = new ImgLoop(document.querySelector('[data-js-active=pic]'), {
        imgWidth: 360,
        imgHeight: 240,
        time:2000,
        callback(index){
            // console.info(index)
            let myArray = document.querySelectorAll('.sector .text_main')
           for(let i=0;i<myArray.length;i++){
               myArray[i].classList.remove('active')
               if (index == i) {
                   myArray[i].classList.add('active')
               }
               $('.picimg').on('mouseover', function () {
                   myArray[i].classList.remove('active')
                   let data_index = +$(this).attr("data-index");
                   imgLoop.go(data_index)
               })
           }

        }
    })
    imgLoop.start().catch(e => console.error(e));
    $('.picimg').on('mouseout', function () {
        // console.info('mouseout')
        imgLoop.start().catch(e => console.error(e))
    })
}()
/*业务版块*/
let scrol1 = document.querySelector(".scroll-content");
$('.zc_right').addClass('leftanim')
$('.zc_left').addClass('rightanim')
$('.zc_one').addClass('zcone')
scrol1 && scrol1.addEventListener('scroll', function () {
    if (scrol1.scrollTop <= 420) {
        $('.zc_right').addClass('leftanim')
        $('.zc_left').addClass('rightanim')
        $('.zc_one').addClass('zcone')
    }
    if (scrol1.scrollTop >= 420) {
        $('.zc_right').removeClass('leftanim')
        $('.zc_left').removeClass('rightanim')
        $('.zc_one').removeClass('zcone')
        $('.bc_left').addClass('leftanim')
        $('.bc_right').addClass('rightanim')
    } else {
        $('.bc_left').removeClass('leftanim')
        $('.bc_right').removeClass('rightanim')
    }
    if (scrol1.scrollTop >= 860) {
        $('.bc_left').removeClass('leftanim')
        $('.bc_right').removeClass('rightanim')
        $('.lc_right').addClass('leftanim')
        $('.lc_left').addClass('rightanim')
    }else {
        $('.lc_right').removeClass('leftanim')
        $('.lc_left').removeClass('rightanim')
    }
    if(scrol1.scrollTop >= 1340){
        $('.lc_right').removeClass('leftanim')
        $('.lc_left').removeClass('rightanim')
        $('.img1').addClass('animat1')
        $('.img2').addClass('animat2')
        $('.img3').addClass('animat3')
        $('.img4').addClass('animat4')
        $('.img5').addClass('animat5')
        $('.gc_left').addClass('leftanim')
        $('.gc_right').addClass('rightanim')
    }else {
        $('.img1').removeClass('animat1')
        $('.img2').removeClass('animat2')
        $('.img3').removeClass('animat3')
        $('.img4').removeClass('animat4')
        $('.img5').removeClass('animat5')
        $('.gc_left').removeClass('leftanim')
        $('.gc_right').removeClass('rightanim')
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
let currPageNum = 1;
let currPageNum2 = 1;

async function getData() {
    let bo = true;
    let list;
    let contentList = [];
    while (bo) {
        let data = await jsonp("https://neeq.ycmedia.cn", {
            disclosureType: 5,
            page: currPageNum - 1,
            companyCd: 830999,
            isNewThree: 1,
            startTime: '',
            endTime: '',
            keyword: '关键字',
            xxfcbj: '',
        })
        ++currPageNum
        if (!data[0].listInfo.content || !data[0].listInfo.content.length) {
            list = data[0].list;
            bo = false;
            return contentList
        }
        contentList.push(...data[0].listInfo.content)
    }
}

// 分页（n=3,tp总页数,p当前页）三种状态：后面显示... 两边显示...n=3表示当前页前后挪3  前面显示...
function getPageList(n, tp, p) {
    n = +n;
    tp = +tp;
    p = +p;
    if (p > tp) {
        p = 1;
    }
    let arr = [];
    let s = n * 2 + 5;
    if (tp >= s) {
        let _n = n;
        let _p = p;
        if (p - n - 2 < 1) {
            while (_p) {
                arr.unshift({number: _p, type: 1});
                --_p;
            }
            _p = p;
            while (++_p <= n * 2 + 3) {
                arr.push({number: _p, type: 1});
            }
            arr.push({text: '...', type: 0}, {number: tp, type: 1});
        } else if (p + n + 2 > tp) {
            while (_p <= tp) {
                arr.push({number: _p, type: 1});
                ++_p;
            }
            _p = p;
            while (--_p > tp - n * 2 - 3) {
                arr.unshift({number: _p, type: 1});
            }
            arr.unshift({number: 1, type: 1}, {text: '...', type: 0});
        } else {
            while (_n) {
                arr.push({number: p - _n, type: 1});
                --_n;
            }
            arr.push({number: p, type: 1});
            _n = n;
            let i = 1;
            while (i <= _n) {
                arr.push({number: p + i, type: 1});
                ++i;
            }
            arr.unshift({number: 1, type: 1}, {text: '...', type: 0});
            arr.push({text: '...', type: 0}, {number: tp, type: 1});
        }
    } else {
        while (tp) {
            arr.unshift({number: tp--, type: 1});
        }
    }
    return arr;
}

// 获取对象第一个属性值
function getObjFirst(obj) {
    for (let i in obj) {
        return obj[i]
    }
}

// 首次将数据全部拿到，存缓存（数据+唯一标识），后面请求一次，拿第一条的唯一标识做比较，相等就说明数据没更新，反之重新请求数据
// ----最后判断是只添加新数据存缓存还是再次全部请求？？？
// 获取唯一标识,请求第一页数据（page = 0）的唯一标识disclosureCode
async function getOnlyId() {
    let data = await jsonp("https://neeq.ycmedia.cn", {
        disclosureType: 5,
        page: 0,
        companyCd: 830999,
        isNewThree: 1,
        startTime: '',
        endTime: '',
        keyword: '关键字',
        xxfcbj: '',
    })
    let id = data[0].listInfo.content[0].disclosureCode
    return id;
}

!function () {
    let investorLSref = document.querySelector('#investorLS');
    let investorDQref = document.querySelector('#investorDQ');
    let eachPageNum = 6;
    noticeLists()

    function noticeLists() {
        getOnlyId().then((id) => {
            renderDatas(id)
        })
    }

    // 判断从哪获取数据
    function renderDatas(onlyId) {
        let store = JSON.parse(getStore('noticeLists'))
        if (store != undefined && store != null && store.onlyId == onlyId) {
            let listsDatas = store.datas
            renderList(listsDatas, '9504')
            renderList(listsDatas, '9503')
        } else {
            getData().then(data => {
                renderList(data, '9504')
                renderList(data, '9503')
                let newLists = []
                data.forEach((v, i) => {
                    let obj = {}
                    obj['disclosureTitle'] = v.disclosureTitle
                    obj['disclosurePostTitle'] = v.disclosurePostTitle
                    obj['disclosureType'] = v.disclosureType
                    obj['disclosureCode'] = v.disclosureCode
                    obj['destFilePath'] = v.destFilePath
                    obj['publishDate'] = v.publishDate
                    newLists.push(obj)
                });
                let noticeLists = {
                    onlyId: data[0].disclosureCode,
                    datas: newLists
                }
                setStore('noticeLists', noticeLists)
            })
        }
    }

    // 渲染页面
    function renderList(contentList, type) {
        let data = contentList.filter((ele) => {
            if (ele.disclosureType === type) return true;
        })
        if (type == '9504') {
            let investorLS = data;
            let investorLSHtml = ''
            for (let i = eachPageNum * (currPageNum - 1); i < eachPageNum * currPageNum && i < data.length; i++) {
                let provi = investorLS[i];
                provi.disclosureTitle = provi.disclosureTitle.replace(/\[临时公告\]/, '');
                provi.disclosurePostTitle = provi.disclosurePostTitle;
                let add = '<li><a target="_blank"  title="' + provi.disclosureTitle + provi.disclosurePostTitle + '" href="http://www.neeq.com.cn' + provi.destFilePath + '">' + provi.disclosureTitle + provi.disclosurePostTitle + '</a><span>' + provi.publishDate + '</span>';
                investorLSHtml += add
            }
            investorLSref.innerHTML = ''
            investorLSref.innerHTML = investorLSHtml
            paging(investorLS)
        } else if (type == '9503') {
            let investorDQ = data;
            let investorDQHtml = ''
            for (let i = eachPageNum * (currPageNum2 - 1); i < eachPageNum * currPageNum2 && i < data.length; i++) {
                let provi = investorDQ[i];
                provi.disclosureTitle = provi.disclosureTitle.replace(/\[定期报告\]/, '');
                provi.disclosurePostTitle = provi.disclosurePostTitle;
                let add = '<li><a target="_blank" title="' + provi.disclosureTitle + provi.disclosurePostTitle + '"  href="http://www.neeq.com.cn' + provi.destFilePath + '">' + provi.disclosureTitle + provi.disclosurePostTitle + '</a><span>' + provi.publishDate + '</span>';
                investorDQHtml += add
            }
            investorDQref.innerHTML = ''
            investorDQref.innerHTML = investorDQHtml
            paging2(investorDQ)
        }
    }

    // 分页
    function paging(data) {
        let maxPage = Math.ceil(data.length / eachPageNum)
        let pages = getPageList(3, maxPage, currPageNum)
        let pageHtml = null
        let pageArr = []
        pages.forEach((v, i) => {
            v.$val = getObjFirst(v)
            if (v.type == 0) {
                pageHtml = `<li data-id="-1">{{ $val }}</li>`
            } else if (v.number == currPageNum) {
                pageHtml = `<li data-id="{{ $val }}" class="active">{{ $val }}</li>`
            } else {
                pageHtml = `<li data-id="{{ $val }}">{{ $val }}</li>`
            }
            pageArr += new Template(pageHtml, v).compile();
        })
        document.getElementById('currPage').innerHTML = pageArr;
        pagingChange()
    }

    function paging2(data) {
        let maxPage = Math.ceil(data.length / eachPageNum)
        let pages = getPageList(3, maxPage, currPageNum2)
        let pageHtml = null
        let pageArr = []
        pages.forEach((v, i) => {
            v.$val = getObjFirst(v)
            if (v.type == 0) {
                pageHtml = `<li data-id="-1">{{ $val }}</li>`
            } else if (v.number == currPageNum2) {
                pageHtml = `<li data-id="{{ $val }}" class="active">{{ $val }}</li>`
            } else {
                pageHtml = `<li data-id="{{ $val }}">{{ $val }}</li>`
            }
            pageArr += new Template(pageHtml, v).compile();
        })
        document.getElementById('currPage2').innerHTML = pageArr;
        pagingChange2()
    }

    // 分页切换
    function pagingChange() {
        let prevPage = document.getElementById('prevPage')
            , nextPage = document.getElementById('nextPage')
            , pages = document.getElementById('currPage').getElementsByTagName('li')
            , count = pages[pages.length - 1].innerText;

        prevPage.onclick = function () {
            if (currPageNum == 1) {
                prevPage.style.color = "#dadada"
            } else if (currPageNum == 2) {
                prevPage.style.color = "#dadada"
                currPageNum--
                noticeLists();
            } else {
                prevPage.style.color = "#aaaaaa"
                currPageNum--
                noticeLists();
            }
        }
        nextPage.onclick = function () {
            if (currPageNum == count) {
                nextPage.style.color = "#dadada"
            } else if (currPageNum == count - 1) {
                nextPage.style.color = "#dadada"
                currPageNum++
                noticeLists();
            } else {
                nextPage.style.color = "#aaaaaa"
                currPageNum++
                noticeLists();
            }
        }
        for (let i = 0; i < pages.length; i++) {
            pages[i].onclick = function () {
                if (this.getAttribute('data-id') == '-1') {
                    return
                } else {
                    for (let j = 0; j < pages.length; j++) {
                        pages[j].className = ' ';
                    }
                    currPageNum = +this.getAttribute('data-id')
                    if (currPageNum == 1) {
                        prevPage.style.color = "#dadada"
                        nextPage.style.color = "#aaaaaa"
                    } else if (currPageNum == count) {
                        prevPage.style.color = "#aaaaaa"
                        nextPage.style.color = "#dadada"
                    } else {
                        prevPage.style.color = "#aaaaaa"
                        nextPage.style.color = "#aaaaaa"
                    }
                    noticeLists();
                }
            }
        }
    }

    function pagingChange2() {
        let prevPage = document.getElementById('prevPage2')
            , nextPage = document.getElementById('nextPage2')
            , pages = document.getElementById('currPage2').getElementsByTagName('li')
            , count = pages[pages.length - 1].innerText;

        prevPage.onclick = function () {
            if (currPageNum2 == 1) {
                prevPage.style.color = "#dadada"
            } else if (currPageNum2 == 2) {
                prevPage.style.color = "#dadada"
                currPageNum2--
                noticeLists();
            } else {
                prevPage.style.color = "#aaaaaa"
                currPageNum2--
                noticeLists();
            }
        }
        nextPage.onclick = function () {
            if (currPageNum2 == count) {
                nextPage.style.color = "#dadada"
            } else if (currPageNum2 == count - 1) {
                nextPage.style.color = "#dadada"
                currPageNum2++
                noticeLists();
            } else {
                nextPage.style.color = "#aaaaaa"
                currPageNum2++
                noticeLists();
            }
        }
        for (let i = 0; i < pages.length; i++) {
            pages[i].onclick = function () {
                if (this.getAttribute('data-id') == '-1') {
                    return
                } else {
                    for (let j = 0; j < pages.length; j++) {
                        pages[j].className = ' ';
                    }
                    currPageNum2 = +this.getAttribute('data-id')
                    if (currPageNum2 == 1) {
                        prevPage.style.color = "#dadada"
                        nextPage.style.color = "#aaaaaa"
                    } else if (currPageNum2 == count) {
                        prevPage.style.color = "#aaaaaa"
                        nextPage.style.color = "#dadada"
                    } else {
                        prevPage.style.color = "#aaaaaa"
                        nextPage.style.color = "#aaaaaa"
                    }
                    noticeLists();
                }
            }
        }
    }
}()

~function () {
    let list = [
        /*{
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
            img: './static/images/caseimg/tu1717.jpg',
            title: 'VIPKID',
            type: '工具类',
            cost: '0.70',
            activation: '8.00',
            rate: '6.00%',
            imglist: ['', '', ''],
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },{
            img: './static/images/caseimg/tu1718.jpg',
            title: '交大成人教育',
            type: '工具类',
            cost: '0.70',
            activation: '8.00',
            rate: '6.00%',
            imglist: ['', '', ''],
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },*/
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
            img: './static/images/caseimg/tu1715.jpg',
            title: '大众点评',
            type: '工具类',
            cost: '0.55 元',
            activation: '6.00 元',
            rate: '10.00%',
            imglist: ['./static/images/caseimg/case15-01.png'],
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },
        {
            img: './static/images/caseimg/tu1716.jpg',
            title: 'KEEP',
            type: '工具类',
            cost: '0.25元',
            activation: '5-6元',
            rate: '',
            imglist: ['./static/images/caseimg/case16-01.jpg', './static/images/caseimg/case16-02.jpg', './static/images/caseimg/case16-03.jpg'],
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },
        {
            img: './static/images/caseimg/tu1719.jpg',
            title: '网易考拉',
            type: '电商类',
            cost: '0.30元',
            activation: '15元',
            rate: '',
            imglist: ['./static/images/caseimg/case19-01.jpg', './static/images/caseimg/case19-02.jpg', './static/images/caseimg/case19-03.jpg'],
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },
        {
            img: './static/images/caseimg/tu1720.jpg',
            title: 'JJ斗地主',
            type: '游戏类',
            cost: '0.23元',
            activation: '3-6元',
            rate: '4.50%',
            imglist: ['./static/images/caseimg/case20-01.jpg', './static/images/caseimg/case20-02.jpg'],
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        }
    ]
    let str = `
        <div class="yccm_client_case_group" data-index="{{$index}}">
            <p class="img"><img src="{{img}}"></p>
            <div class="yccm_client_case_text">{{title}}</div>
            <p class="yccm_client_case_timetext clear">
                <span style="display: {{typeShow}}">客户类型：{{type}}</span>
                <span style="display: {{costShow}}">CPC成本：{{cost}}</span>
            </p>
            <p class="yccm_client_case_timetext clear">
                <span style="display: {{activationShow}}">激活成本：{{activation}}</span>
                <span style="display: {{rateShow}}">点击率：{{rate}}</span>
            </p>
            <a href="javascript:void(0);" class="link">查看详情&nbsp;&gt;</a>
        </div>
    `;

    let caseList = '';
    list.forEach((data, i) => {
        data.$index = i;
        if (!data.type) data.typeShow = 'none';
        if (!data.cost) data.costShow = 'none';
        if (!data.activation) data.activationShow = 'none';
        if (!data.rate) data.rateShow = 'none';
        caseList += new Template(str, data).compile();
    })
    document.querySelector('.yccm_popup_bodyText').innerHTML = caseList;

    $('.yccm_client_case_group').on('click', function () {
        $('#popup').fadeToggle(500)
        let data_index = $(this).attr("data-index");
        Details(data_index)
    })
    $('#yccm_client_return').on('click',function () {
        $('#popup').fadeToggle(500)
    })
    function Details(index) {
        let html = `
        <div class="yccm_client_details clear">
            <div class="yccm_client_details_left">
                <div class="imgtubox">
                    <div class="tulist" data-js-case-active="img_box">
                        {{imghtml}}
                    </div>
                </div>
                <a href="javascript:;" class="prev arrow" data-js-case-active="img_prev"><img src="./static/images/zuojiantou.png" alt=""></a>
                <a href="javascript:;" class="next arrow" data-js-case-active="img_next"><img src="./static/images/youjiantou.png" alt=""></a>
            </div>
            <div class="yccm_client_details_right">
                <h2 class="title">{{title}}<span>案例时间：{{time}}</span></h2>
                <p class="text">
                    {{target}}
                </p>
                <ul class="features">
                    <li style="display: {{typeShow}}">案例类型：{{type}}</li>
                    <li style="display: {{platformShow}}">投放平台：{{platform}}</li>
                    <li style="display: {{costShow}}">CPC成本：{{cost}}</li>
                    <li style="display: {{activationShow}}" class="baizi">激活成本：{{activation}}</li>
                    <li style="display: {{rateShow}}">点击率：{{rate}}</li>
                </ul>
                <div class="btn_box">
                    <a href="javascript:;" class="kongbtn" data-js-case-active="next">下一个案例</a>
                    <a href="javascript:;" class="previous" data-js-case-active="prev">上一个</a>
                </div>
            </div>
        </div>
    `;
        let data = list[+index];
        data.imghtml = data.imglist.map(l => `<img src="${l}"/>`).join('')
        document.querySelector('.yccm_popup_body').innerHTML = '';

        if (!data.type) data.typeShow = 'none';
        if (!data.platform) data.platformShow = 'none';
        if (!data.cost) data.costShow = 'none';
        if (!data.activation) data.activationShow = 'none';
        if (!data.rate) data.rateShow = 'none';

        document.querySelector('.yccm_popup_body').innerHTML = new Template(html, data).compile();
        document.querySelector('[data-js-case-active=next]').onclick = () => {
            if (list.length <= data.$index + 1) {
                Details(0)
            } else {
                Details(data.$index + 1)
            }
        }
        document.querySelector('[data-js-case-active=prev]').onclick = () => {
            if (data.$index - 1 < 0) {
                Details(list.length - 1)
            } else {
                Details(data.$index - 1)
            }
        }

        new ImgLoop(document.querySelector('[data-js-case-active=img_box]'), {
            imgWidth: 254,
            imgHeight: 494,
            nextRef: document.querySelector('[data-js-case-active=img_next]'),
            prevRef: document.querySelector('[data-js-case-active=img_prev]'),
        }).start().catch(e => console.error(e))
    }

}()

/**
 * 存储localStorage
 */
function setStore(name, content) {
    if (!name) return;
    if (typeof content !== 'string') {
        content = JSON.stringify(content);
    }
    window.localStorage.setItem(name, content);
}

/**
 * 获取localStorage
 */
function getStore(name) {
    if (!name) return;
    return window.localStorage.getItem(name);
}

/**
 * 删除localStorage
 */
function removeStore(name) {
    if (!name) return;
    window.localStorage.removeItem(name);
}

document.querySelector('#nowyear').innerHTML = new Date().getFullYear()

/*隐私条例*/

$('#about').on('click', function () {
    $('#yccm_client').fadeToggle(500)
    if ($('#yccm_client').hasClass("yccm_client2")) {

    } else {
        $('#yccm_client').addClass("yccm_client2");
    }
});
$('#yccm_return').on('click',function () {
    $('#yccm_client').fadeToggle(500)
})
$('#click_here').on('click', function () {
    $.get("http://stat.adpush.cn/ClearCookie.ashx", {})
    $('#out').show();
    $('.yccm_body').hide();
    let ch = document.documentElement.clientHeight || document.body.clientHeight;
    $('#out').css('height', ch - 289);
    //窗口改动的时候
    window.onresize = function () {
        //获取窗口高度
        let ch = document.documentElement.clientHeight || document.body.clientHeight;
        $('#out').css('height', ch - 289);
    }
})

