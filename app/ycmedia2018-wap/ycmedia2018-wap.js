import '../../common/css/base.less'
import './css/index.less'
import '../../common/js/vendor'


let navbar=document.getElementById("navbar-toggle");
let description_box=document.getElementById("description_box");
let item_box=document.getElementById("bomb_box")

navbar.addEventListener('click',()=>{
    if(description_box.classList.contains('blocks')){
        description_box.classList.remove('blocks');
    }else {
        description_box.classList.add('blocks');
    }
    if(item_box.classList.contains('blocks')){
        item_box.classList.remove('blocks');
    }else {
        item_box.classList.add('blocks');
    }
})
description_box.addEventListener('click',(e)=>{
    if(e.target.nodeName == 'DIV' && e.target.classList.contains('description_box')){
        item_box.classList.remove('blocks');
        description_box.classList.remove('blocks');
    }
})

var head_list = document.getElementById("head_list");
var menu_content = document.getElementById("menu_content");
var oli = head_list.getElementsByTagName("span");
var odiv = menu_content.getElementsByTagName("div");
var odian = document.getElementById("dian");
var dian = odian.getElementsByTagName("span");
for(var i=0 ; i<oli.length ; i++){
    oli[i].index = i;//定义index变量，以便让tab按钮和tab内容相互对应
    oli[i].onclick = function( ){//移除全部tab样式和tab内容
        for(var i =0; i < oli.length; i++){
            oli[i].className = "";
            odiv[i].style.display = "none";
            dian[i].className = '';
        }
        this.className = "active";//为当前tab添加样式
        odiv[this.index].style.display="block";//显示当前tab对应的内容
        dian[this.index].className = 'on';
    }
}


let scrol = document.querySelector(".scroll-content");
let offSet = document.querySelector(".introduction").offsetTop;
let aa = document.querySelector('.top');
scrol && scrol.addEventListener('scroll', function () {
    let t = scrol.scrollTop;
    if (t > offSet) {
        aa.className = 'top topbg'
    }else {
        aa.className = 'top'
    }
})
