import '../../common/css/base.less'
import './css/index.less'
import '../../common/js/vendor'
import {Router, triggerClose} from "../../common/js/util";

// function a() {
//     document.getElementById("time").innerHTML=time;
//     time--;
//     if(time<0){
//         clearInterval(dsp)
//     }
// }
// var dsp=setInterval(a,1000)


//------------------------------------------------------------------------------------------------------//
//路由配置
let router = new Router([
    {
        path: '',
        component: 'home'
    }, {
        path: 'home',
        component: 'home'
    }, {
        path: 'dati',
        component: 'dati'
    }, {
        path: 'list',
        component: 'list'
    }, {
        path: 'rule',
        component: 'rule'
    }
]);

//登陆弹窗
triggerClose('#loginInput', ['#loginInput .close', '#login_btn']);
//获取复活卡
triggerClose('#revive_rule', ['#revive_rule .close', '.revive_btn']);

/**
 * 答题逻辑
 * 1. 初始化答题界面
 * 2. 选择答案
 * 3. 公布答案
 */

function subjectInit() {

}

function subjectSelect() {

}

function subjectEnd() {

}
