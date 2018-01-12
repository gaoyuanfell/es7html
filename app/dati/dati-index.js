import '../../common/css/base.less'
import './css/index.less'
import '../../common/js/vendor'
import {Ajax, Router, sleep, triggerClose} from "../../common/js/util";

Ajax.configSetup({
    beforeSend: function (xhr, data, config) {
        config.headers.set('access-token', window.localStorage.getItem('access-token'));
        config.headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8')
    },
    baseUrl: '//192.168.100.12:9060'
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
        redirectTo: 'home',
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
let layerLogin = triggerClose('#loginInput', ['#loginInput .close', '#login_btn']);
//获取复活卡
let layerRevive = triggerClose('#revive_rule', ['#revive_rule .close', '.revive_btn']);

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

    static subject_data_num = 'subject-data-num';
    static subject_data = 'subject-data';

    constructor() {
        this.subjectNum = +window.localStorage.getItem(Questioning.subject_data_num) || 1;
        this.subjectInit().then(() => {
            this.subjectEnd();
        });
    }

    subjectNum = 1;//当前答题的顺序
    subjectId;//当前答题的编号
    selectSubjectId;//用户选中的ID
    subjecStart = false;//是否开始答题

    async subjectInit() {
        //通过接口获取数据

        let data = JSON.parse(window.localStorage.getItem(Questioning.subject_data));
        if (!data) {
            data = {
                id: 1,
                answerTime: 5,
                answerInterval: 2,
                total: 3,
            };
        }

        this.subjectId = data.id;

        while (data.total > 0) {
            //通过接口获取题目 {code:data.id,current:this.subjectNum}

            //显示题目
            this.itemList();
            this.subjecStart = true;//开始答题
            console.info(`开始答题：${this.subjectNum}`)

            //答题倒计时
            let state = await this.countDown(data.answerTime, data.answerInterval);
            if (!state) return;

            console.info(`获取用户选择的答案：${this.selectSubjectId}`);

            //提交答案

            //答案提交成功后改变这个数据
            ++this.subjectNum;
            --data.total;
            window.localStorage.setItem(Questioning.subject_data, JSON.stringify(data));
            window.localStorage.setItem(Questioning.subject_data_num, String(this.subjectNum));

            await sleep(1000);
            //获取用户选择的答案 答题结束
            console.info(`获取答案顺序：${this.subjectNum}`);
            this.publishList();
            await sleep(2000);
            this.selectSubjectId = null;
        }
        //答题完成移除数据
        window.localStorage.removeItem(Questioning.subject_data);
        window.localStorage.removeItem(Questioning.subject_data_num);
        return true;
    }

    subjectEnd() {

    }

    destroy() {

    }

    /**
     * 答题倒计时和获取答案倒计时
     * @param num
     * @param num2
     * @returns {Promise<boolean>}
     */
    async countDown(num = 0, num2 = 0) {
        let timeRef = window.document.querySelector('#dati #time');
        while (this.subjecStart) {
            timeRef.innerText = num;
            if (num <= 0) {
                this.subjecStart = false;
            } else {
                await sleep(1000);
                --num;
            }
        }

        let stop = true;
        while (stop) {
            if (num2 <= 0) {
                stop = false;
            } else {
                await sleep(1000);
                --num2;
            }
        }

        return true;
    }

    subjectRef = window.document.querySelector('#subject_body');

    //题目数据
    subjectData = {
        title: '“垂死病中惊坐起”是谁写给谁的？',
        list: [
            {
                id: 1,
                code: 'A',
                title: '元稹写给白居易的'
            },
            {
                id: 2,
                code: 'B',
                title: '杜甫写给李白的'
            },
            {
                id: 3,
                code: 'C',
                title: '王维写给孟浩然'
            },
        ]
    };

    //答案公布数据
    publishData = {
        answer: true,
        title: '“垂死病中惊坐起”是谁写给谁的？',
        list: [
            {
                id: 1,
                code: 'A',
                title: '元稹写给白居易的',
                total: 4.2
            },
            {
                id: 2,
                code: 'B',
                title: '杜甫写给李白的',
                isAnswer: true,
                total: 2.2
            },
            {
                id: 3,
                code: 'C',
                title: '王维写给孟浩然',
                total: 1.2
            },
        ]
    };

    itemList() {
        let li = ``;
        this.subjectData.list.every(l => {
            li += `
                <li class="item" data-id="${l.id}">
                    <div class="text">${l.title}</div>
                </li>
            `;
            return true;
        });

        this.subjectRef.innerHTML = `<h2 class="title">${this.subjectNum + '.' + this.subjectData.title}</h2><ul class="option">${li}</ul>`;

        let children = this.subjectRef.querySelector('.option').children;
        Array.from(children).every(ch => {
            ch.onclick = () => {
                if (this.selectSubjectId) return;
                ch.classList.add('active');
                this.selectSubjectId = ch.dataset.id;
                console.info(`用户选择了：${this.selectSubjectId}`);
                this.subjecStart = false;//本题答题结束
            };
            return true
        });
    }

    publishList() {
        let li = ``;
        this.publishData.list.every(l => {
            li += `
                <li class="item publish" data-id="${l.id}">
                    <div class="text">${l.title}<span>${l.total}万</span></div>
                    <div class="full${l.isAnswer ? ' fulllan' : ' fullhui'}"></div>
                </li>
            `;
            return true;
        });
        this.subjectRef.innerHTML = `<h2 class="title">${(this.subjectNum - 1) + '.' + this.publishData.title}</h2><ul class="option">${li}</ul>`;
    }
}

/**
 * 首页
 */
export class HomeInit {
    constructor() {
        let token = this.token = window.localStorage.getItem('access-token');
        if (!token) {
            this.loginBtnRef.style.display = 'none';
            this.inviteBtnRef.style.display = 'block';
        } else {
            this.inviteBtnRef.style.display = 'none';
            this.loginBtnRef.style.display = 'block';
        }
        this.initEvent();
    }

    token;//登陆标识

    initEvent() {
        this.sendRef.onclick = () => {
            this.sendPhone();
        }
        this.loginRef.onclick = () => {
            this.login();
        }
    }

    loginBtnRef = window.document.querySelector('#home #login_btn');
    inviteBtnRef = window.document.querySelector('#home #invite_btn');

    sendRef = window.document.querySelector('#home .verification_btn');
    loginRef = window.document.querySelector('#login');
    phoneNumRef = window.document.querySelector('#phoneNum');
    verificationRef = window.document.querySelector('#verification');

    sendPhone() {
        let phone = this.phoneNumRef.value;
        let reg = /^1[3-9]\d{9}$/;
        if (!reg.test(phone)) {
            alert("请填写正确的手机号！");
            return;
        }
        Ajax('post', '/api/jwt/message', {phoneNum: phone}, {baseUrl: ''}).then(res => {
            if (res.status) {
                alert('发送成功！');
            } else {
                alert(res.msg);
            }
        }).catch(err => console.info(err));
    }

    login() {
        let phoneNum = this.phoneNumRef.value;
        let messageCode = this.verificationRef.value;
        if (!messageCode) alert("请填写正确的验证码！");
        Ajax('post', '/api/jwt/user/login', {phoneNum: phoneNum, messageCode: messageCode}).then(res => {
            if (res.status) {
                layerLogin.trigger();
                window.localStorage.setItem('access-token', res.data.token);
            } else {
                alert(res.msg);
            }
        }).catch(err => console.info(err));
    }
}

router.changeEvent.subscribe((data) => {
    console.info(data);
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
