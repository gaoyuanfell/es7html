import '../../common/css/base.less'
import './css/index.less'
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
    url += toBodyString(body);
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
function toBodyString(obj, bo = true) {
    let ret = [];
    for (let key in obj) {
        let values = obj[key];
        if (values && values.constructor === Array) { //数组
            let queryValues = [];
            for (let i = 0, len = values.length, value; i < len; i++) {
                value = values[i];
                queryValues.push(toQueryPair(key, value));
            }
            ret = ret.concat(queryValues);
        } else { //字符串
            ret.push(toQueryPair(key, values, bo));
        }
    }
    return ret.join('&');
}
function toQueryPair(key, value, bo) {
    if (typeof value === 'undefined') {
        return key;
    }
    return key + '=' + (bo ? encodeURIComponent(value === null ? '' : String(value)) : value === null ? '' : String(value));
}
let slidedirect = null;

//新闻
let page = 1;
let channel_id = 1;

//获取推荐数据
function getRecommendData(){
    return new Promise( (resolve,reject)=>{
        jsonp('https://feed.baidu.com/feed/api/wise/feedlist',{
            sid: '123407_117040_123291_122851_103342_120199_23018_119383_118895_118865_118839_118828_118790_120549_107311_117332_117429_122788_123572_122960_114820_123700_123500_122496_110085_123290'
            ,ssid: 0
            ,from: '844b'
            ,pu: 'sz%401320_2001%2Cta%40iphone_1_11.0_3_604'
            ,qid: ''
            ,clickDownload: 0
            ,tabId: 1
            ,channel_id:channel_id
            ,page: page
            ,sessionId: 15264583827843
            ,crids:''
            ,startlistnum: 8
            ,rfs: 7
            ,loadeditems: ['newsThree','typeSmallPics','typeNewsOne','ecomAds']
        }).then( (data)=>{
            resolve(data)
        })
    })

}
//推荐
function jsonp5(){
    getRecommendData().then((data)=>{
        document.getElementById('loading').style.display = 'none'
        let html = data.result.tab.data
        let div = document.createElement('div')
        div.innerHTML = html
        document.querySelector('.main').appendChild(div)
        jsonp4()
    })
}
jsonp5();
//广告
function jsonp4(){
    jsonp('https://feed.baidu.com/feed/api/wise/getwiseafdads',{
        _api: 'new'
        ,query: 'wise_index'
    ,cp: 'wise_home_page'
    ,pui: 0
    ,pn: 0
    ,from: 0
    ,wsw: 414
    ,wsh: 736
    ,wiw: 414
    ,wih: 736
    ,sid: ''
    ,wosid:''
    ,wbwsid:''
    ,isWiFi: 1
    ,nettype: 2
    ,fc: 1
    ,ft: 3
    ,pos: 7
    ,total: 4
    ,ecom: null
    }).then( (data)=>{
        document.getElementById('loading').style.display = 'none'
        let html = data.ad_place_list["0"].ad_place_data
        let div = document.createElement('div')
        div.innerHTML = html
        document.querySelector('.main').appendChild(div)
    })
}
//除推荐外的其他数据
function getAttentionData(){
    return new Promise( (resolve,reject)=>{
        jsonp('https://feed.baidu.com/feed/data/tab/getattentionlist',{
            sid: '123407_117040_123291_122851_103342_120199_123018_119383_118895_118865_118839_118828_118790_120549_107311_117332_117429_122788_123572_122960_114820_123700_123500_122496_110085_123290'
            ,ssid: 0
            ,from: '844b'
            ,pu: 'sz%401320_2001%2Cta%40iphone_1_11.0_3_604'
            ,qid: ''
            ,ms: 1
            ,channel_id: channel_id
            ,source: 'wise_feed_attentiontab'
            ,direction: 'main'
            ,async: 0
            ,startlistnum: 1
        }).then( (data)=>{
            resolve(data)
        })
    })

}
function getattentionlist(){
    getAttentionData().then( (data)=>{
        document.getElementById('loading').style.display = 'none'
        let html = data.result.tab.tabTpl
        let div = document.createElement('div')
        div.innerHTML = html
        document.querySelector('.main').appendChild(div)
    })
}
//视频
function getvideolist(){
    jsonp('https://www.baidu.com/feed/data/tab/getvideolist',{
        sid: '123407_117040_123291_122851_103342_120199_123018_119383_118895_118865_118839_118828_118790_120549_107311_117332_117429_122788_123572_122960_114820_123700_123500_122496_110085_123290'
        ,ssid: 0
        ,from: '844b'
        ,pu: 'sz%401320_2001%2Cta%40iphone_1_11.0_3_604'
        ,qid: '0918142091'
        ,ms: 1
        ,channel_id: channel_id
        ,source: 'wise_feed_videotab'
        ,direction: 'bottom'
        ,async: 1
        ,startlistnum: 1
    }).then( (data)=>{
        console.log(data)
    })
}

function getScrollTop(){
    let scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
    if(document.body){
        bodyScrollTop = document.body.scrollTop;
    }
    if(document.documentElement){
        documentScrollTop = document.documentElement.scrollTop;
    }
    scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
    return scrollTop;
}
//文档的总高度
function getScrollHeight(){
    let scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
    if(document.body){
        bodyScrollHeight = document.body.scrollHeight;
    }
    if(document.documentElement){
        documentScrollHeight = document.documentElement.scrollHeight;
    }
    scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
    return scrollHeight;
}
function getWindowHeight(){
    let windowHeight = 0;
    if(document.compatMode == "CSS1Compat"){
        windowHeight = document.documentElement.clientHeight;
    }else{
        windowHeight = document.body.clientHeight;
    }
    return windowHeight;
}
//搜索
function search(){
    let input = document.getElementById('searchInput')
    let height = document.querySelector('.search_input').offsetTop
    input.onfocus = function(){
        document.documentElement.scrollTop = document.body.scrollTop = height
    }
    document.getElementById('searchBtn').onclick = function(){
        let val = input.value
        if(val == ''){
            return
        }else{
            location.href = 'https://m.baidu.com/s?word='+val
        }
    }
}
window.onload = function(){
    let swiper = new Swiper('.menu_cont',{
        slidesPerView:6,
        freeMode:true,
    });
    let swiper2 = new Swiper({
        el: '.nav_cont',
        slidesPerView: 6,
        slidesPerGroup: 6,
        loop: true,
        loopFillGroupWithBlank: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        }
    });
    menuClick();
    scroll();
    slideDirect();
    search();
    toolClick();
    dragRefresh();

}
//刷新时 返回顶部
window.onbeforeunload = function(){
    document.documentElement.scrollTop = document.body.scrollTop = 0
}
//导航点击
function menuClick(){
    let oDiv =  document.getElementById('menu').getElementsByTagName('div')
    for(let i = 0; i < oDiv.length; i++){
        oDiv[i].onclick = function(){
            for(let j = 0; j < oDiv.length; j++){
                oDiv[j].className = 'swiper-slide'
            }
            document.documentElement.scrollTop = document.body.scrollTop = 222
            this.className = 'swiper-slide active'
            let id = this.getAttribute('data-id')
            channel_id = id
            document.querySelector('.main').innerHTML = ''
            changeId(channel_id)
        }
    }
}
//
function changeId(id){
    switch (+id){
        case 1:
            jsonp5();
            break;
        default:
            getattentionlist()
            break;
    }
}

function scroll(){
    let menu = document.querySelector('.menu');
    let menuTop = menu.offsetTop;
    let cont = document.querySelector('.main')
    window.onscroll = function(){
        let pageYOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        if(pageYOffset >= menuTop){
            menu.classList.add('fixed_top');
        }else{
            menu.classList.remove('fixed_top');
        }
        if(pageYOffset > 1200 && slidedirect == 'up'){
            document.querySelector('.tab-tools').classList.add('show-tools')
        }else{
            document.querySelector('.tab-tools').classList.remove('show-tools')
        }
        if(pageYOffset == 0){
            dragRefresh();
        }
        if(getScrollTop() + getWindowHeight() == getScrollHeight()){
            document.getElementById('loading').style.display = 'block'
            setTimeout( ()=>{
                changeId(channel_id)
            },200)
        }
    }
}

//滑动方向
function slideDirect(){
    let startY = 0;
    window.addEventListener('touchstart',function(e){
        startY = e.touches[0].pageY;
    },false)
    window.addEventListener('touchend',function(ev){
        let endY = ev.changedTouches[0].pageY;
        if( endY - startY  < 0 ){
            slidedirect = 'bottom'
        }else{
            slidedirect = 'up'
        }
    })
}
// 点击刷新，返回顶部
function toolClick(){
    let refresh = document.querySelector('.tab-refresh')
    let backTop = document.querySelector('.tab-back')
    refresh.onclick = function(){
        // document.documentElement.scrollTop = document.body.scrollTop = 200
        location.reload();
    }
    backTop.onclick = function(){
        let timer = null;
        let top =  document.documentElement.scrollTop || document.body.scrollTop
        let speed = top / 1000 * 10
        if(speed < 150 ){
            speed = 150
        }
        timer = setInterval( ()=>{
            if(top <= 0){
                clearInterval(timer)
            }else{
                let newTop = top - speed
                top = newTop
                console.log(top)
                document.documentElement.scrollTop = document.body.scrollTop = newTop
            }
        },10)
    }
}
//滚动条在顶部时，下拉刷新
let cont = document.querySelector('.main')
let upLoad = document.getElementById('uploading')
let startY = 0;
function dragRefresh(){
    cont.addEventListener('touchstart',touchStart,false)
    cont.addEventListener('touchmove',touchMove,false)
    cont.addEventListener('touchend',touchEnd,false)
}
function touchStart(ev){
    startY = ev.touches[0].pageY;
}
function touchMove(ev){
    if(getScrollTop() == 0) {
        let endY = ev.changedTouches[0].pageY;
        let h = endY - startY
        if(h > 0){
            cont.style.transform = 'translateY('+h+'px)'
            cont.style.transition = 'all .2s'
            upLoad.style.opacity = 1
            upLoad.innerText = '下拉刷新'
            if (endY - startY >= 30) {
                cont.style.transform = 'translateY(30px)'
                upLoad.innerText = '松开刷新'
            }
        }
    }
}
function touchEnd(ev){
    if(getScrollTop() == 0){
        let endY = ev.changedTouches[0].pageY;
        let h = endY - startY
        if(h  < 30){
            cont.style.transform = 'translateY(0)'
        }else{
            upLoad.innerText = '正在刷新'
            setTimeout( ()=>{
                dragRefreshData();
            },100)
        }
    }

}
function dragRefreshData(){
    if(channel_id == 1){
        getRecommendData().then( (data)=>{
            upLoad.style.opacity = 0
            cont.style.transform='translateY(0)'
            let html = data.result.tab.data
            let div = document.createElement('div')
            let firstDiv = cont.getElementsByTagName('div')[0]
            div.innerHTML = html
            cont.insertBefore(div,firstDiv)
        })
    }else{
        getAttentionData().then( (data)=>{
            upLoad.style.opacity = 0
            cont.style.transform='translateY(0)'
            let html = data.result.tab.tabTpl
            let div = document.createElement('div')
            let firstDiv = cont.getElementsByTagName('div')[0]
            div.innerHTML = html
            cont.insertBefore(div,firstDiv)
        })
    }
}
