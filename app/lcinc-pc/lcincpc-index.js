import '../../common/css/base.less'
import './css/index.less'
import '../../common/js/vendor'


const filtersRef = document.querySelector("#filters");
filtersRef.addEventListener('click', (e) => {
    Array.from(filtersRef.children).forEach(f => {
        f.classList.remove('active')
        if (f.contains(e.target)) {
            f.classList.add('active')
        }
    })
});

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


