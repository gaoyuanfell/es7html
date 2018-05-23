import '../../common/js/vendor'
import '../../common/css/base.less'
import './css/index.less'
import {getHash} from "../../common/js/util";
import * as qs from "querystring";



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

    if(hash == 'login'){
        document.querySelector('.top_msg').style.display='none'
        document.querySelector('.top_nav').style.display='none'
        document.querySelector('.contentener').style.paddingBottom='0'
    }else{
        document.querySelector('.top_msg').style.display='block'
        document.querySelector('.top_nav').style.display='block'
        document.querySelector('.contentener').style.paddingBottom='42px'
    }
    if(hash == 'commodity'){
        init();
        searchGoods();
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
let doMainName = "https://admin.lcyp.net"
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

// 发送验证码
async function sendCode(){
    let codeBtn = document.getElementById('sendCode');
    let phoneNumber = document.getElementById('phoneNumber').value;
    let mobile = checkPhone(phoneNumber);
    if(mobile){
        let data = await jsonp(doMainName+"/api/v1/send_login_sms_code",{
            phone_number: phoneNumber
        })
        if(data.status_code == 200){
            let timer = null;
            let num = 60;
            // clearInterval(timer);
            timer = setInterval(function(){
                num--;
                let text = `${num}秒后重新发送`;
                if(num == 0){
                    clearInterval(timer);
                    text = `点击重新发送`;
                    codeBtn.removeAttribute('disabled');
                    codeBtn.style.color = '#fff';

                }else{
                    codeBtn.setAttribute('disabled','disabled');
                    codeBtn.style.color = '#ccc';
                }
                codeBtn.innerHTML = text;
            },1000)
        }else{
            alert(data.error_message);
        }
    }
}
// 验证手机号
function checkPhone(number){
    if(!(/^1[34578]\d{9}$/.test(number))){
        alert("请输入有效的手机号码");
        return false;
    }else{
        return true
    }
}
// 验证登录
async function login(){
    let code = document.getElementById("code").value;
    let phoneNumber = document.getElementById('phoneNumber').value;
    let mobile = checkPhone(phoneNumber);
    if(!mobile){
        return 
    }else if(mobile && code != ''){
        let data = await jsonp(doMainName+"/api/v1/sms_login",{
            phone_number : phoneNumber,
            code : code
        })
        if(data.status_code == 200){
            location.href='https://admin.lcyp.net/manage'
            document.querySelectorAll('.right_btn').style.display = 'none'
        }else{
            alert(data.error_message);
        }
    }else{
        alert("请输入正确的验证码")
    }
}

// 商品列表
let firstId = 0
    ,secondId = 0
    ,currPageNum = 1
    ,productName = '';
const limit = 12;
// 获取商品列表数据
let firstIn = true
async function getGoodsLists(){
    if(firstIn){
        document.querySelector('.loading').style.display = 'block'
    }
    firstIn = false
    let data = await jsonp(doMainName + "/api/v1/get/product_list",{
        product_category_id_first: firstId,
        product_category_id: secondId,
        product_name: productName,
        p: currPageNum,
        limit: limit
    })
    if(data.is_logined){
        document.querySelector('.right_btn .btn').style.display = 'none'
        let p =`<a class="jump_manage" href="https://admin.lcyp.net/manage">后台管理中心</a>`
        document.querySelector('.right_btn').innerHTML = p
    }
    return data

}
// 一级分类
function firstLevel(data){
   
        // 一级分类
        let cateHtml = `
            <li data-id="{{ $id }}"><a>{{ label }}</a></li>
        `
        let firstLevel = [];
        data.category_list.sort( (a,b)=>{
            return +a.value > +b.value
        })
        data.category_list.forEach( (v,i)=>{
            v.$id = +v.value
            firstLevel += new Template(cateHtml, v).compile();
        })
        document.getElementById('firstLevel').innerHTML = firstLevel;
        document.getElementById('firstLevel').getElementsByTagName('li')[0].className = 'active'
        secondLevel(data)
    
}
// 二级分类
function secondLevel(data){
    let oLis = document.getElementById('firstLevel').getElementsByTagName('li');
    // 默认
    let cateHtml = `<li data-id="0" title="全部" class="active"><a>全部</a></li>`
    document.getElementById('secondLevel').innerHTML = cateHtml;
    // 点击
    for(let i = 0; i < oLis.length; i++){
        oLis[i].onclick = function(){
            for(let j = 0 ; j < oLis.length; j++){
                oLis[j].className = ' ';
            }
            this.className = 'active'
            let id = this.getAttribute('data-id')
            firstId = id
            secondId = 0
            currPageNum = 1;
            productName = '';
            showGoods()
            paging(data)
            data.category_list.forEach( (v,i )=>{
                if(id == +v.value){
                    let secondLevel = [
                        '<li data-id="0" title="全部"><a>全部</a></li>'
                    ]
                    let cateHtml = `<li data-id="{{ $id }}" title="{{ label }}"><a>{{ label }}</a></li>`
                    v.children.forEach( (v2,i2)=>{
                        v2.$id = +v2.value
                        if(v2.value == 0){
                            return
                        }else{
                            secondLevel += new Template(cateHtml, v2).compile();
                        }
                    })
                    document.getElementById('secondLevel').innerHTML = secondLevel;
                    let firstDom = document.getElementById('secondLevel').getElementsByTagName('li')[0]
                    firstDom.className = 'active'
                    let oLis = document.getElementById('secondLevel').getElementsByTagName('li');
                    for(let i = 0; i < oLis.length; i++){
                        oLis[i].onclick = function(){
                            for(let j = 0 ; j < oLis.length; j++){
                                oLis[j].className = ' ';
                            }
                            this.className = 'active'
                            let id2 =   this.getAttribute('data-id')
                            secondId = id2
                            currPageNum = 1;
                            productName = '';
                            showGoods()
                            paging(data)
                        }
                    }
                }
            })
        }
    }
}
function init(){
    getGoodsLists().then((data)=>{
        firstLevel(data);
        firstShow(data)
    })
}
function firstShow(data){
    document.querySelector('.loading').style.display = 'none'
        if(data.list.length ==0 ){
            document.getElementById('goodsLists').innerHTML = '暂无商品'
        }else{
            let html = ``
            let goodsLists = [];
            data.list.forEach( (v,i)=>{
                v.$index = i;
                if(v.brand == ''){
                    html = `
                        <li data-index={{$index}}>
                        <div class="img"><img src="{{ cover_url}}"></div>
                        <div class="msg clear">
                            <p class="title" title="{{ name }}">{{ name }}</p>
                            <span>一级分类：{{ first_category_name }}</span>
                            <span>二级分类：{{ category_name }}</span>
                            <span>零售规格：{{ unit }}</span>
                        </div>
                        <a class="buy_btn">
                            <i></i>
                            <span>前往购买</span>
                        </a>
                    </li>
                    `
                }else{
                    html = `
                        <li data-index={{$index}}>
                            <div class="img"><img src="{{ cover_url}}"></div>
                            <div class="msg clear">
                                <p class="title" title="{{ name }}">{{ name }}</p>
                                <span>一级分类：{{ first_category_name }}</span>
                                <span>二级分类：{{ category_name }}</span>
                                <span>零售规格：{{ unit }}</span>
                                <span title="{{ brand }}">生产厂商：{{ brand }}</span>                        
                            </div>
                            <a class="buy_btn">
                                <i></i>
                                <span>前往购买</span>
                            </a>
                        </li>
                    `
                }
                goodsLists += new Template(html, v).compile();
            })
            document.getElementById('goodsLists').innerHTML = goodsLists;
            let allBtn = document.querySelectorAll('.buy_btn')
            for(let i = 0; i < allBtn.length; i++){
                allBtn[i].onclick = function(){
                    jumpToBuy(data.is_logined);
                }
            }
            let pagingStatu = document.getElementById('paging')
            if(data.total_count <= limit){
                pagingStatu.style.display = 'none';
            }else{
                pagingStatu.style.display = 'flex';
            }
            paging(data)
            document.getElementById('searchInput').value = ''
        }
}
// 显示商品列表
function showGoods(){
    getGoodsLists().then( (data)=>{
        firstShow(data)
    })
}
// 分页生成
function paging(data){
    let count = Math.ceil( data.total_count / limit )
    let page = getPageList(3,count,currPageNum)
    let pageHtml = null
    let pageArr = []
    page.forEach( (v,i)=>{
        v.$val = getObjFirst(v)
        if(v.type == 0){
            pageHtml = `<li data-id="-1">{{ $val }}</li>`
        }else if(v.number == currPageNum){
            pageHtml = `<li data-id="{{ $val }}" class="active">{{ $val }}</li>`
        }else{
            pageHtml = `<li data-id="{{ $val }}">{{ $val }}</li>`
        }
        pageArr += new Template(pageHtml,v).compile();
    })
    document.getElementById('currPage').innerHTML = pageArr;
    document.getElementById('count').innerHTML = count;
    pagingChange();
}
// 分页切换
function pagingChange(){
    let prevPage = document.getElementById('prevPage')
        ,nextPage = document.getElementById('nextPage')
        ,lastPage = document.getElementById('lastPage')
        ,pages = document.getElementById('currPage').getElementsByTagName('li')
        ,inputNum = document.getElementById('inputNum')
        ,pageJump = document.getElementById('pageJump')
        ,count = pages[pages.length - 1].innerText;
    prevPage.onclick = function(){
        if( currPageNum == 1){
            prevPage.style.color="#dadada"
        }else if(currPageNum == 2){
            prevPage.style.color="#dadada"
            currPageNum--
            showGoods();
        }else{
            prevPage.style.color="#aaaaaa"
            currPageNum--
            showGoods();
        }
    }
    nextPage.onclick = function(){
        if( currPageNum == count){
            nextPage.style.color="#dadada"
        }else if(currPageNum == count - 1){
            nextPage.style.color="#dadada"
            currPageNum++
            showGoods();
        }else{
            nextPage.style.color="#aaaaaa"
            currPageNum++
            showGoods();
        }
    }
    lastPage.onclick = function(){
        if(currPageNum == count){
            return
        }else{
            currPageNum = count
            nextPage.style.color="#dadada"
            showGoods();
        }
    }
    pageJump.onclick = function(){
        let num = inputNum.value;
        if(num<=1){
            num = 1
        }else if(num >= count){
            num = count
        }
        if(currPageNum == num ){
            return
        }else{
            currPageNum = num;
            showGoods();
            inputNum.value = '';
        }
    }
    for(let i = 0; i < pages.length; i++){
        pages[i].onclick = function(){
            if(this.getAttribute('data-id') == '-1'){
                return
            }else{
                for(let j = 0 ; j < pages.length; j++){
                    pages[j].className = ' ';
                }
                currPageNum = this.getAttribute('data-id')
                if(currPageNum == 1){
                    prevPage.style.color="#dadada"
                    nextPage.style.color="#aaaaaa"
                }else if( currPageNum == count){
                    prevPage.style.color="#aaaaaa"
                    nextPage.style.color="#dadada"
                }else{
                    prevPage.style.color="#aaaaaa"
                    nextPage.style.color="#aaaaaa"
                }
                showGoods();
            }
        }
    }
}
// 搜索
function searchGoods(){
    let searchBtn = document.getElementById('searchBtn')
    let historyDiv = document.getElementById('searchHistory')

    searchBtn.onclick = function(){
        let searchInput = document.getElementById('searchInput').value
        productName = searchInput
        firstId = 0;
        secondId = 0;
        currPageNum = 1;
        showGoods();
        let a = document.createElement('a')
        a.innerHTML = searchInput
        a.onclick = function(){
            let val = this.innerHTML
            productName =  val
            firstId = 0;
            secondId = 0;
            currPageNum = 1;
            showGoods();
        }
        let searchHistory = historyDiv.getElementsByTagName('a')
        historyDiv.insertBefore(a,searchHistory[0])
        if(searchHistory.length > 5){
            historyDiv.removeChild(searchHistory[ searchHistory.length -1 ])
        }
    }

}

// 获取对象第一个属性值
function getObjFirst(obj){
    for(let i in obj){
        return obj[i]
    }
}
// 判断登录状态并跳转
function jumpToBuy(login){
    if(login){
        location.href="https://admin.lcyp.net/manage"
    }else{
        location.href="#login"
    }
}

window.onload = function(){


    document.getElementById('sendCode').onclick = function(){
        sendCode();
    }
    document.getElementById('loginBtn').onclick = function(){
        login();
    }
    // 协议
    let agreement = document.getElementById('agreement')
    document.getElementById('agreementBtn').onclick = function(ev){
        agreement.style.display= 'block'
        var oEvent = ev || event;
        oEvent.cancelBubble = true;
    }
    document.querySelector('.login').onclick = function(){
        agreement.style.display= 'none'
    }
    document.getElementById('close').onclick = function(){
        agreement.style.display= 'none'
    }
    agreement.onclick = function(ev){
        var oEvent = ev || event;
        oEvent.cancelBubble = true;
    }
    document.getElementById('nowYear').innerHTML = nowYear()
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

// 版权年份
function nowYear(){
    let date = new Date();
    let year = date.getFullYear();
    return year
}
hashChange();
window.addEventListener('hashchange', () => {
    hashChange()
});
