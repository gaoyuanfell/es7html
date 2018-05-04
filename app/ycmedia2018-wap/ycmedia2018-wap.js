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




