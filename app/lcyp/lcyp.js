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

    if(hash == 'login'){       
        document.querySelector('.top_msg').style.display='none'
        document.querySelector('.top_nav').style.display='none'
        document.querySelector('.bottom_coryright').style.display='none'
    }else{
        document.querySelector('.top_msg').style.display='block'
        document.querySelector('.top_nav').style.display='block'
        document.querySelector('.bottom_coryright').style.display='block'
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
        console.log(data)
        if(data.status_code == 200){
            alert("发送成功")
            let timer = null;
            let num = 60;
            clearInterval(timer);
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
    if(mobile && code != ''){
        let data = await jsonp(doMainName+"/api/v1/sms_login",{
            phone_number : phoneNumber,
            code : code
        })
        if(data.status_code == 200){
            history.go(-1);
        }else{
            alert(data.error_message);
        }
    }else{
        alert("请输入正确的验证码")
    }
}

document.getElementById('sendCode').onclick = function(){
    sendCode();
}
document.getElementById('loginBtn').onclick = function(){
    login();
}

// 商品列表
async function getGoodsLists(){
    let data = await jsonp(doMainName + "/api/v1/get/product_list")
    console.log(data)
}
window.onload = function(){
    getGoodsLists();
}
