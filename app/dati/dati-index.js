import '../../common/css/base.less'
import './css/index.less'
import '../../common/js/vendor'
import {Ajax, Router, sleep, triggerClose} from "../../common/js/util";

Ajax.configSetup({
    beforeSend: function (xhr, data, config) {
        config.headers.set('access-token', window.localStorage.getItem('access-token'));
        config.headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8')
    },
    // baseUrl: 'http://192.168.100.12:9060',
    baseUrl: 'http://192.168.100.100:38080',
});

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
    }, {
        path: 'count',
        component: 'count'
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
    static subject_id = 'subject-id';

    constructor() {
        this.subjectNum = +window.localStorage.getItem(Questioning.subject_data_num) || 0;
        this.subjectInit().then(() => {
            this.subjectEnd();
        });
    }

    subjectNum = 0;//当前答题的顺序
    subjectId;//当前答题的编号
    selectSubjectId;//用户选中的ID
    subjecStart = false;//是否开始答题

    //-------------------------------------API-----------------------------------------//
    /**
     * 初始化答题接口
     * @returns {Promise<void>}
     */
    async qmmBegin() {
        let beginData = await Ajax('get', '/qmm/begin');
        if (beginData.status) {
            return beginData.data;
        } else {
            alert('请稍后重试！');
            throw 'server error';
        }
    }

    /**
     * 当所有的题目答完请求接口
     * @param body
     * @returns {Promise<boolean>}
     */
    async qmmFinish(body) {
        let finishData = await Ajax('get', '/qmm/finish', body);
        return finishData.status === true;
    }

    /**
     * 获取题目
     * {code,current}
     * @param body
     * @returns {Promise<void>}
     */
    async getSubject(body) {
        let subjectData = await Ajax('get', '/qmm/getqq', body);
        if (subjectData.status) {
            return subjectData.data;
        } else {
            alert('请稍后重试！');
            throw 'server error';
        }
    }

    /**
     * 提交答案
     * @param body
     * @returns {Promise<void>}
     */
    async pushSubject(body) {
        let getaqqData = await Ajax('get', '/qmm/getaqq', body);
        if (getaqqData.status) {
            return getaqqData.data;
        } else {
            alert('请稍后重试！');
            throw 'server error';
        }
    }


    //------------------------------------------------------------------------------//

    async subjectInit() {
        //通过接口获取数据
        let data = JSON.parse(window.localStorage.getItem(Questioning.subject_data));
        // data = {
        //     id: 33,
        //     answerTime: 10,
        //     answerInterval: 3,
        //     total: 10,
        // };
        if (!data) {
            data = await this.qmmBegin()
        }
        /* else {
                    if (confirm('是否开始新一轮答题？')) {
                        data = await this.qmmBegin()
                    }
                }*/

        this.subjectId = data.id;
        window.localStorage.setItem(Questioning.subject_id,this.subjectId);

        while (data.total > 0) {
            //通过接口获取题目 {code:data.id,current:this.subjectNum}
            this.subjectData = await this.getSubject({code: this.subjectId, current: this.subjectNum});

            //答案提交成功后改变这个数据 逻辑变更 拿到题目后就需要统计
            ++this.subjectNum;
            --data.total;
            window.localStorage.setItem(Questioning.subject_data, JSON.stringify(data));
            window.localStorage.setItem(Questioning.subject_data_num, String(this.subjectNum));

            /**
             * 处理adx答题逻辑
             */
            if (+this.subjectData.type === 2) {

            }

            this.subjectBoxRef.style.display = 'block';
            //显示题目
            this.itemList();
            this.subjecStart = true;//开始答题
            console.info(`开始答题：${this.subjectNum}`);

            //答题倒计时
            await this.countDown(data.answerTime, data.answerInterval, (type) => {
                if (type === 1) {
                    //答题倒计时
                    console.info(type)
                    //没选择就不再让用户选择
                    if (!this.selectSubjectId) {
                        let children = this.subjectRef.querySelector('.option').children;
                        Array.from(children).every(ch => {
                            ch.dataset.disabled = 'disabled';
                            ch.classList.add('disabled');
                            return true
                        });
                    }
                    window.document.body.querySelector('#time_loading').style.display = 'block';
                }
            });


            console.info(`获取用户选择的答案是：${this.selectSubjectId}`);

            //提交答案 获取答案
            this.publishData = await this.pushSubject({titleId: this.subjectData.titleId, id: this.selectSubjectId || 0, code: this.subjectId});

            //用户是否答对
            let answer = this.publishData.answer;
            if (answer) {
                window.document.body.querySelector('#dadui').style.display = 'block';
            } else {
                window.document.body.querySelector('#dacuo').style.display = 'block';
            }

            //获取用户选择的答案 答题结束

            console.info(`获取答案顺序：${this.subjectNum}`);
            this.publishList();
            await sleep(2000);
            this.selectSubjectId = null;
            this.subjectBoxRef.style.display = 'none';
            if (data.total > 0) {
                await sleep(1000);
            }
        }

        window.localStorage.removeItem(Questioning.subject_data);
        window.localStorage.removeItem(Questioning.subject_data_num);

        //答题完成移除数据 当所有的题目答完请求接口
        await this.qmmFinish({id: this.subjectId});
        return true;
    }

    subjectEnd() {
        console.info('subjectEnd');
        router.navigate('count')
    }

    destroy() {

    }

    /**
     * 答题倒计时和获取答案倒计时
     * @param num
     * @param num2
     * @returns {Promise<boolean>}
     */
    async countDown(num = 0, num2 = 0, fn) {
        window.document.body.querySelector('#time_loading').style.display = 'none';
        window.document.body.querySelector('#dadui').style.display = 'none';
        window.document.body.querySelector('#dacuo').style.display = 'none';
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
        fn && fn(1);
        let stop = true;
        while (stop) {
            if (num2 <= 0) {
                stop = false;
            } else {
                await sleep(1000);
                --num2;
            }
        }
        fn && fn(2);
        return true;
    }

    subjectBoxRef = window.document.querySelector('#subject_box');
    subjectRef = window.document.querySelector('#subject_body');

    //题目数据
    subjectData
    /* = {
            titleId: 1,
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
            ],
            type:1,
            url:''
        };*/

    //答案公布数据
    publishData

    /* = {
            titleId: 1,
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
        };*/

    itemList() {
        let li = ``;
        this.subjectData.list.every(l => {
            li += `
                <li class="item" data-id="${l.id}">
                    <div class="text">${(l.code || '') + '、' + l.title}</div>
                </li>
            `;
            return true;
        });

        this.subjectRef.innerHTML = `<h2 class="title">${this.subjectNum + '、' + this.subjectData.title}</h2><ul class="option">${li}</ul>`;

        let children = this.subjectRef.querySelector('.option').children;
        Array.from(children).every(ch => {
            ch.onclick = () => {
                if (this.selectSubjectId || ch.dataset.disabled) return;
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
        let total = this.publishData.list.map(l => l.total).reduce((r, i) => r += i);
        this.publishData.list.every(l => {
            li += `
                <li class="item publish" data-id="${l.id}">
                    <div class="text">${(l.code || '') + '、' + l.title}<span>${l.total}万</span></div>
                    <div style="width: ${Math.floor(l.total / total * 100)}%" class="full${l.answer ? ' fulllan' : ' fullhui'}"></div>
                </li>
            `;
            return true;
        });
        this.subjectRef.innerHTML = `<h2 class="title">${(this.subjectNum) + '、' + this.publishData.title}</h2><ul class="option">${li}</ul>`;
    }
}

/**
 * 首页
 */
export class HomeInit {
    constructor() {
        let token = this.token = window.localStorage.getItem('access-token');
        if (token) {
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
        };
        this.loginRef.onclick = () => {
            this.login();
        };
        this.datiBtnRef.onclick = () => {
            if (!this.token) {
                layerLogin.trigger();
                return;
            }
            router.navigate('dati');
        }
    }

    datiBtnRef = window.document.querySelector('#home #dati_btn');

    loginBtnRef = window.document.querySelector('#home #login_btn');
    inviteBtnRef = window.document.querySelector('#home #invite_btn');

    sendRef = window.document.querySelector('#home .verification_btn');
    loginRef = window.document.querySelector('#login');
    phoneNumRef = window.document.querySelector('#phoneNum');
    verificationRef = window.document.querySelector('#verification');

    /**
     * 验证码倒计时
     * @param time
     */
    codeCountDown(time = 60) {
        this.sendRef.setAttribute('disabled', 'disabled');
        let text = this.sendRef.innerText;
        this.sendRef.innerText = `${text} ${time}`;
        let setIntervalNum = setInterval(() => {
            if (time <= 0) {
                clearInterval(setIntervalNum);
                this.sendRef.removeAttribute('disabled');
                this.sendRef.innerText = text;
                return;
            }
            --time;
            this.sendRef.innerText = `${text} ${time}`;
        }, 1000);
    }

    /**
     * 发送验证码
     */
    sendPhone() {
        this.codeCountDown();
        let phone = this.phoneNumRef.value;
        let reg = /^1[3-9]\d{9}$/;
        if (!reg.test(phone)) {
            alert("请填写正确的手机号！");
            return;
        }
        Ajax('post', '/api/jwt/message', {phoneNum: phone}).then(res => {
            if (res.status) {
                this.codeCountDown();
                alert('发送成功！');
            } else {
                alert(res.msg);
            }
        }).catch(err => console.info(err));
    }

    /**
     * 登陆
     */
    login() {
        let phoneNum = this.phoneNumRef.value;
        let reg = /^1[3-9]\d{9}$/;
        if (!reg.test(phoneNum)) {
            alert("请填写正确的手机号！");
            return;
        }
        let messageCode = this.verificationRef.value;
        if (!messageCode) {
            alert("请填写正确的验证码！");
            return;
        }
        Ajax('post', '/api/jwt/user/login', {phoneNum: phoneNum, messageCode: messageCode}).then(res => {
            if (res.status) {
                layerLogin.trigger();
                window.localStorage.setItem('access-token', res.data.token);
                this.token = res.data.token;
                this.loginBtnRef.style.display = 'none';
                this.inviteBtnRef.style.display = 'block';
            } else {
                alert(res.msg);
            }
        }).catch(err => console.info(err));
    }
}

/**
 * 统计
 */
export class CountInit {
    constructor() {
        let subjectId = window.localStorage.getItem(Questioning.subject_id);
        this.getGold({code:subjectId || 0}).then(res => {
            let correctNum = res.correctNum;
            let errorNum = res.errorNum;
            window.document.querySelector("#count_all").innerText = correctNum + errorNum;
            window.document.querySelector("#count_correctNum").innerText = correctNum;
            window.document.querySelector("#count_errorNum").innerText = errorNum;
        }).catch(()=>{
            router.navigate('home');
        })
    }

    /**
     * 统计题目对错
     * @param body
     * @returns {Promise<void>}
     */
    async getGold(body) {
        let qmmGoldData = await Ajax('get', '/qmm/gold', body);
        if (qmmGoldData.status) {
            return qmmGoldData.data;
        } else {
            alert('请稍后重试！');
            throw 'server error';
        }
    }


}

/**
 * 路由监听
 */
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
        case 'count':
            new CountInit();
            break;
        case 'dati':
            new Questioning();
            break;
    }
});
