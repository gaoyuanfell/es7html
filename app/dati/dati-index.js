import '../../common/css/base.less'
import './css/index.less'
import '../../common/js/vendor'
import {getHash, triggerClose} from "../../common/js/util";
let zIndex = 1000

let time=10;
let login=document.querySelector("#login_btn");
let description_box=document.querySelector("#description_box");
let item_box=document.querySelector("#loginInput")
let close=document.querySelector(".close")
let invitebtn=document.querySelector("#invite_btn")
let invite_input=document.querySelector("#invite_input")
let revive_btn=document.querySelector(".revive_btn")
let revive_rule=document.querySelector("#revive_rule")


login.addEventListener('click',()=>{
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
        invite_input.classList.remove('blocks');
        revive_rule.classList.remove('blocks');
    }
})
close.addEventListener('click',()=>{
    description_box.classList.remove('blocks');
    item_box.classList.remove('blocks');
    revive_rule.classList.remove('blocks');
})

invitebtn.addEventListener('click',()=>{
    if(description_box.classList.contains('blocks')){
        description_box.classList.remove('blocks');
    }else {
        description_box.classList.add('blocks');
    }
    if(invite_input.classList.contains('blocks')){
        invite_input.classList.remove('blocks');
    }else {
        invite_input.classList.add('blocks');
    }
})
revive_btn.addEventListener('click',()=>{
    if(description_box.classList.contains('blocks')){
        description_box.classList.remove('blocks');
    }else {
        description_box.classList.add('blocks');
    }
    if(revive_rule.classList.contains('blocks')){
        revive_rule.classList.remove('blocks');
    }else {
        revive_rule.classList.add('blocks');
    }
})

function a() {
    document.getElementById("time").innerHTML=time;
    time--;
    if(time<0){
        clearInterval(dsp)
    }
}
var dsp=setInterval(a,1000)

























//------------------------------------------------------------------------------------------------------//

// triggerClose()
