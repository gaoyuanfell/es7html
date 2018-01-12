import '../../common/css/base.less'
import './css/index.less'
import '../../common/js/vendor'
import {Ajax, Router, triggerClose} from "../../common/js/util";

let config = {
    baseUrl:'//192.168.100.12:9060',
}

Ajax.configSetup({
    beforeSend:function (xhr, data) {
        xhr.setRequestHeader('access-token',window.localStorage.getItem('access-token'))
    }
});

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
])

//登陆弹窗
triggerClose('#loginInput', ['#loginInput .close', '#login_btn']);
//获取复活卡
triggerClose('#revive_rule', ['#revive_rule .close', '.revive_btn']);

/**
 * 答题逻辑
 * 1. 初始化答题界面
 * 2. 选择答案
 * 3. 公布答案
 *
 * active 当前选中的
 * disabled 不可选
 * publish 答案公布
 */
export class Questioning {
    constructor() {
        this.subjectInit();
        this.subjectSelect();
        this.subjectEnd();
    }

    subjectInit() {
        //通过接口获取题目
        console.info('subjectInit')
    }

    subjectSelect() {
        //将选择的题目答案发送给接口
        console.info('subjectSelect')
    }

    subjectEnd() {
        //获取答案
        console.info('subjectEnd')
    }
}

/**
 * 首页
 */
export class HomeInit{
    constructor(){

    }



}

router.changeEvent.subscribe((data) => {
    switch (data.path) {
        case 'home':
            new HomeInit();
            break;
        case 'list':
            console.info('list');
            break;
        case 'rule':
            console.info('rule');
            break;
        case 'dati':
            new Questioning();
            break;
    }
});
