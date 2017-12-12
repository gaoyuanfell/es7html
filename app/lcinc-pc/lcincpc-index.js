import '../../common/css/base.less'
import './css/index.less'
import '../../common/js/vendor'

import {sleep} from "../../common/js/util";

let zIndex = 1000
    const filtersRef = document.querySelector("#filters");

    filtersRef.addEventListener('click', (e) => {
        let fRef=null;
        Array.from(filtersRef.children).forEach(f => {
            f.classList.remove('active')
            if (f.contains(e.target)) {
                f.classList.add('active')
                fRef=f;
                // console.info(fRef);
            }
        })
        const homepage=document.querySelector("#home_page");
        const pointpage=document.querySelector("#point_page");

        const type=fRef.dataset.type;
        // console.info(type)
        if(pointpage.dataset.type == type){
            pointpage.style.display="block";
            homepage.style.display='none';
            pointpage.style.zIndex = ++zIndex;
            pointpage.animate([
                { opacity:0},
                { opacity:1}
            ], {
                duration:500
            })
        }else if(homepage.dataset.type == type){
            homepage.style.display="block";
            pointpage.style.display='none';
            homepage.style.zIndex = ++zIndex;
            homepage.animate([
                { opacity:0},
                { opacity:1}
            ], {
                duration:500
            })
        }




})





//-----------------------------------------------------
const oBtnLeft = document.getElementById("prev");
const oBtnRight = document.getElementById("next");
const oDiv = document.getElementById("indexmaindiv");
const oUl = document.getElementById("product_list");
const aLi = oUl.getElementsByClassName("list");
const now = -1 * (aLi[0].offsetWidth);
oUl.style.width = aLi.length * (aLi[0].offsetWidth) + 'px';
oBtnRight.onclick = function () {
    const n = Math.floor((aLi.length * (aLi[0].offsetWidth) + oUl.offsetLeft) / aLi[0].offsetWidth);

    if (n <= 4) {
        move(oUl, 'left', 0);
    }
    else {
        move(oUl, 'left', oUl.offsetLeft + now);
    }
}
oBtnLeft.onclick = function () {
    const now1 = -Math.floor((aLi.length-4)) * (aLi[0].offsetWidth);
    console.info(now1);
    if (oUl.offsetLeft >= 0) {
        move(oUl, 'left', now1);
    }
    else {
        move(oUl, 'left', oUl.offsetLeft - now);
    }
}
let timer = setInterval(oBtnRight.onclick, 3000);
oDiv.onmouseover = function () {
    clearInterval(timer);
}
oBtnLeft.onmouseover = function () {
    clearInterval(timer);
}
oBtnRight.onmouseover = function () {
    clearInterval(timer);
}
oDiv.onmouseout = function () {
    timer = setInterval(oBtnRight.onclick, 3000);
}
oBtnLeft.onmouseout = function () {
    timer = setInterval(oBtnRight.onclick, 3000);
}
oBtnRight.onmouseout = function () {
    timer = setInterval(oBtnRight.onclick, 3000);
}

function getStyle(obj, name) {
    if (obj.currentStyle) {
        return obj.currentStyle[name];
    }
    else {
        return getComputedStyle(obj, false)[name];
    }
}

function move(obj, attr, iTarget) {
    clearInterval(obj.timer)
    obj.timer = setInterval(function () {
        let cur = 0;
        if (attr == 'opacity') {
            cur = Math.round(parseFloat(getStyle(obj, attr)) * 100);
        }
        else {
            cur = parseInt(getStyle(obj, attr));
        }
        let speed = (iTarget - cur) / 1;
        speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
        if (iTarget == cur) {
            clearInterval(obj.timer);
        }
        else if (attr == 'opacity') {
            obj.style.filter = 'alpha(opacity:' + (cur + speed) + ')';
            obj.style.opacity = (cur + speed) / 100;
        }
        else {
            obj.style[attr] = cur + speed + 'px';
        }
    }, 30);
}

//-----------------------------------------------------

document.querySelector("#submit").addEventListener("click", (e) => {
    submit()
})

function submit() {
    let company_name = document.querySelector("#company_name").value
    let scope = document.querySelector("#scope").value
    let name = document.querySelector("#name").value
    let phone_number = document.querySelector("#phone_number").value


    if (!company_name) {
        alert('请输入公司名称');
        return;
    }
    if (!scope) {
        alert('请输入公司规模');
        return;
    }
    if (!name) {
        alert('请输入您的姓名');
        return;
    }
    if (!phone_number) {
        alert('请输入您的电话号码');
        return;
    }
    let reg = /^1[3-9]\d{9}$/;
    if (!reg.test(phone_number)) {
        alert("请填写正确的手机号！");
        return;
    }

}

//---------------------------------

async function inserted(el) {
    let top = 0;
    let bo = true;
    while (bo) {
        ++top
        let height = el.clientHeight / el.children.length;
        if (top > height) {
            let f = el.firstElementChild;
            let l = el.lastElementChild;
            el.insertBefore(f, l.nextSibling);
            top = 0;
        }
        el.style.top = `-${top}px`;
        await sleep(80);
    }
}
let pointList = document.querySelector('#pointList')
inserted(pointList);



//---------------------------


window.addEventListener('hashchange', () => {
    hashChange()
});

function hashChange(){
    let hash = location.hash;
    let reg = hash.match(/(\d+)/);
    let home = document.getElementById("home");
    if (!reg) {
        home.style.display = 'block';
        home.style.zIndex = ++zIndex;
        home.animate([
            { opacity:0},
            { opacity:1}
        ], {
            duration:200
        })
        return;
    }
    let detail = document.getElementById("goods-detail");
    let n = document.getElementById("details");
    /*const productlist = document.querySelector("#product_list");*/

    let index = reg[0];
    if (+index) {
        detail.style.display = 'block';
        detail.style.zIndex = ++zIndex;
        detail.animate([
            { opacity:0},
            { opacity:1}
        ], {
            duration:200
        })
        n.src = '../static/images/img' + index + '.jpg'
    }else{
        goods.style.display = 'block';
        goods.style.zIndex = ++zIndex;
        detail.animate([
            { opacity:1},
            { opacity:0}
        ], {
            duration:200
        })
    }
}
