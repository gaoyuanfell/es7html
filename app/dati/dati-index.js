import '../../common/css/base.less'
import './css/index.less'
import '../../common/js/vendor'
import {Ajax, Base64, Router, sleep, triggerClose} from "../../common/js/util";

Ajax.configSetup({
    beforeSend: function (xhr, data, config) {
        config.headers.set('access-token', window.localStorage.getItem('access-token'));
        config.headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    },
    baseUrl: 'http://192.168.100.12:9060',
    // baseUrl: 'http://192.168.100.100:38080',
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
        this.subjectInit().then((bo) => {
            bo && this.subjectEnd();
        });
    }

    subjectNum = 0;//当前答题的顺序
    subjectId;//当前答题的编号
    selectSubjectId;//用户选中的ID
    subjecStart = false;//是否开始答题
    start = true;

    //-------------------------------------API-----------------------------------------//
    /**
     * 初始化答题接口
     * @returns {Promise<void>}
     */
    async qmmBegin() {
        let beginData = await Ajax('get', '/question/qmm/begin');
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
        let finishData = await Ajax('get', '/question/qmm/finish', body);
        return finishData.status === true;
    }

    /**
     * 获取题目
     * {code,current}
     * @param body
     * @returns {Promise<void>}
     */
    async getSubject(body) {
        let subjectData = await Ajax('get', '/question/qmm/getqq', body);
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
        let getaqqData = await Ajax('get', '/question/qmm/adda', body);
        if (getaqqData.status) {
            return getaqqData.data;
        } else {
            alert('请稍后重试！');
            throw 'server error';
        }
    }

    /**
     * 提交答案 adx
     * @param body
     * @returns {Promise<void>}
     */
    async pushAdxSubject(body) {
        let getaqqData = await Ajax('post', '/question/saveAdxQuestion', body, {
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            }
        });
        if (getaqqData.status) {
            return getaqqData.data;
        } else {
            alert('请稍后重试！');
            throw 'server error';
        }
    }

    /**
     * 获取答案
     * @param body
     * @returns {Promise<void>}
     */
    async getTrueSubject(body) {
        let getaqqData = await Ajax('get', '/question/qmm/getaqq', body);
        if (getaqqData.status) {
            return getaqqData.data;
        } else {
            alert('请稍后重试！');
            throw 'server error';
        }
    }

    /**
     * 获取adx接口数据
     * @param body
     * @returns {Promise<{ti: *, dsc: string}>}
     */
    async getAdxSubject(body = {}) {
        let res = await Ajax('get', this.subjectData.url, body, {
            baseUrl: '', beforeSend: () => {
            }
        });
        if (res && res.code == 0) {
            this.subjectData.title = res.ti;
            let list = [];
            this.subjectData.list = res.dsc.split(/\r\n/).every(m => {
                let ms = m.match(/(.*)\:(.*)/);
                if (ms) {
                    list.push({
                        code: ms[1],
                        title: ms[2]
                    })
                }
                return true;
            });
            this.subjectData.list = list;
            return {
                ti: res.ti,
                dsc: window.btoa ? (window.btoa(res.dsc)) : new Base64().encode(res.dsc),
                price: res.price
            }
        } else {
            alert('请稍后重试！');
            throw 'server error';
        }
    }

    /**
     * adx500 统计普通pv
     * @param body
     * @returns {Promise<void>}
     */
    async adxCount(body = {}) {
        let res = await Ajax('post', '/question/noAdx/count', body);
        if (res.status) {
            return res.data;
        } else {
            alert('请稍后重试！');
            throw 'server error';
        }
    }

    //------------------------------------------------------------------------------//

    async subjectInit() {
        //通过接口获取数据
        let data = JSON.parse(window.localStorage.getItem(Questioning.subject_data));
        if (!data) {
            data = await this.qmmBegin()
        }

        this.subjectId = data.id;
        window.localStorage.setItem(Questioning.subject_id, this.subjectId);

        while (data.total > 0 && this.start) {
            //通过接口获取题目 {code:data.id,current:this.subjectNum}
            this.subjectData = await this.getSubject({code: this.subjectId, current: this.subjectNum});

            /**
             * 处理adx答题逻辑
             */
            let adxBody;
            if (+this.subjectData.type === 2 && this.start) {
                console.info('adx题库');
                this.subjectData.$list = this.subjectData.list;
                this.subjectData.$title = this.subjectData.title;
                adxBody = await this.getAdxSubject().catch((e) => {
                    this.subjectData.list = this.subjectData.$list;
                    this.subjectData.title = this.subjectData.$title;
                    this.subjectData.type = 1;//adx题库错误 采用普通题库
                    this.adxCount({
                        titleId: this.subjectData.titleId,
                        code: this.subjectId,
                    }).catch(() => {
                    })
                })
            }

            this.subjectBoxRef.style.display = 'block';
            if (!this.start) return false;
            //显示题目
            this.itemList();
            this.subjecStart = true;//开始答题
            console.info(`开始答题：${this.subjectNum}`);

            //答题倒计时
            await this.countDown(data.answerTime);
            if (!this.start) return false;

            //没选择就不再让用户选择
            if (!this.selectSubjectId) {
                let children = this.subjectRef.querySelector('.option').children;
                Array.from(children).every(ch => {
                    ch.dataset.disabled = 'disabled';
                    ch.classList.add('disabled');
                    return true
                });
            }
            console.info(`获取用户选择的答案是：${this.selectSubjectId}`);

            //提交答案
            let publishBody = {
                titleId: this.subjectData.titleId,
                id: this.selectSubjectId || 0,
                code: this.subjectId
            }

            if (this.subjectData.type == 1) {
                await this.pushSubject({titleId: this.subjectData.titleId, id: this.selectSubjectId || 0, code: this.subjectId});
            } else if (this.subjectData.type == 2) {
                let adxData = await this.pushAdxSubject({
                    ti: adxBody.ti,
                    dsc: adxBody.dsc,
                    checked_option: this.selectSubjectId || 0
                });
                publishBody = {
                    titleId: adxData.question_id,
                    id: adxData.checked_option_id || 0,
                    price: adxBody.price,
                    code: this.subjectId
                }
            }

            //答案提交成功后改变这个数据 逻辑变更 拿到题目后就需要统计
            ++this.subjectNum;
            --data.total;
            window.localStorage.setItem(Questioning.subject_data, JSON.stringify(data));
            window.localStorage.setItem(Questioning.subject_data_num, String(this.subjectNum));
            if (!this.start) return false;

            window.document.body.querySelector('#time_loading').style.display = 'block';
            //等待答案
            await this.countDown2(data.answerInterval);
            if (!this.start) return false;

            //获取统计结果
            this.publishData = await this.getTrueSubject(publishBody);
            if (!this.start) return false;

            //用户是否答对
            let answer = this.publishData.answer;
            if (answer) {
                window.document.body.querySelector('#dadui').style.display = 'block';
            } else {
                window.document.body.querySelector('#dacuo').style.display = 'block';
            }

            //获取用户选择的答案 答题结束

            this.publishList();
            await sleep(2000);
            if (!this.start) return false;
            this.selectSubjectId = null;
            this.subjectBoxRef.style.display = 'none';
            if (data.total > 0) {
                await sleep(1000);
            }
        }
        if (!this.start) return false;
        window.localStorage.removeItem(Questioning.subject_data);
        window.localStorage.removeItem(Questioning.subject_data_num);
        //答题完成移除数据 当所有的题目答完请求接口
        await this.qmmFinish({id: this.subjectId});
        return true;
    }

    subjectEnd() {
        router.navigate('count')
    }

    destroy() {
        this.subjectNum = 0;
        this.subjectId = null;
        this.start = false;
        this.selectSubjectId = null;
        this.subjecStart = false;
        window.localStorage.removeItem(Questioning.subject_data);
        window.localStorage.removeItem(Questioning.subject_data_num);
    }

    /**
     * 答题倒计时和获取答案倒计时
     * @param num
     * @param num2
     * @returns {Promise<boolean>}
     */
    async countDown(num = 0) {
        window.document.body.querySelector('#time_loading').style.display = 'none';
        window.document.body.querySelector('#dadui').style.display = 'none';
        window.document.body.querySelector('#dacuo').style.display = 'none';
        let timeRef = window.document.querySelector('#dati #time');
        while (this.subjecStart && this.start) {
            timeRef.innerText = num;
            if (num <= 0) {
                this.subjecStart = false;
            } else {
                await sleep(1000);
                --num;
            }
        }
        return true;
    }

    //等待答案
    async countDown2(num = 0) {
        window.document.body.querySelector('#dadui').style.display = 'none';
        window.document.body.querySelector('#dacuo').style.display = 'none';
        let stop = true;
        while (stop && this.start) {
            if (num <= 0) {
                stop = false;
            } else {
                await sleep(1000);
                --num;
            }
        }
        return true;
    }

    subjectBoxRef = window.document.querySelector('#subject_box');
    subjectRef = window.document.querySelector('#subject_body');

    //题目数据
    subjectData

    //答案公布数据
    publishData

    itemList() {
        let li = ``;
        this.subjectData.list.every((l, i) => {
            li += `
                <li class="item" data-id="${l.id || i + 1}">
                    <div class="text">${(l.code || '') + '、' + l.title}</div>
                </li>
            `;
            return true;
        });

        this.subjectRef.innerHTML = `<h2 class="title">${(this.subjectNum + 1) + '、' + this.subjectData.title}</h2><ul class="option">${li}</ul>`;

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
        this.init();
    }

    token;//登陆标识

    init() {
        this.getUserInfo().then(res => {
            document.querySelector('#integralAndProfit').style.display = 'block';
            document.querySelector('#integral').innerHTML = res.integral || 0;
            document.querySelector('#profit').innerHTML = res.money || 0;
        })
    }

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
    inviteBtnRef = window.document.querySelector('#home #dati_btn');
    // inviteBtnRef = window.document.querySelector('#home #invite_btn');

    sendRef = window.document.querySelector('#home .verification_btn');
    loginRef = window.document.querySelector('#login');
    phoneNumRef = window.document.querySelector('#phoneNum');
    verificationRef = window.document.querySelector('#verification');

    async getUserInfo(body) {
        let res = await Ajax('get', '/question/user/income', body);
        if (res.status) {
            return res.data;
        } else if (res.code == 401) {

        } else {
            alert('请稍后重试！');
            throw 'server error';
        }
    }

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
                window.location.reload();
                // layerLogin.trigger();
                // window.localStorage.setItem('access-token', res.data.token);
                // this.token = res.data.token;
                // this.loginBtnRef.style.display = 'none';
                // this.inviteBtnRef.style.display = 'block';
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
        this.getGold({code: subjectId || 0}).then(res => {
            let correctNum = res.correctNum;
            let errorNum = res.errorNum;
            window.document.querySelector("#count_all").innerText = correctNum + errorNum;
            window.document.querySelector("#count_correctNum").innerText = correctNum;
            window.document.querySelector("#count_errorNum").innerText = errorNum;
        }).catch(() => {
            router.navigate('home');
        })
    }

    /**
     * 统计题目对错
     * @param body
     * @returns {Promise<void>}
     */
    async getGold(body) {
        let qmmGoldData = await Ajax('get', '/question/qmm/gold', body);
        if (qmmGoldData.status) {
            return qmmGoldData.data;
        } else {
            alert('请稍后重试！');
            throw 'server error';
        }
    }
}

/**
 * 排行榜
 */
export class ListInit {
    constructor() {
        this.init();
    }

    init() {
        this.menu('#account_menu', 'active', async (res) => {
            switch (res.dataset.type) {
                case '1':
                    this.list = await this.topDay();
                    break;
                case '2':
                    this.list = await this.topHistory();
                    break
            }
            this.getList();
        })
    }

    list

    menu(ref, c, fn) {
        let accountMenuRef = window.document.querySelector(ref)
        Array.from(accountMenuRef.children).every(ac => {
            if (ac.classList.contains(c)) {
                fn && fn(ac)
            }
            return true;
        });
        accountMenuRef.onclick = (event) => {
            Array.from(accountMenuRef.children).every(ac => {
                ac.classList.remove(c);
                if (ac.contains(event.target)) {
                    ac.classList.add(c);
                    fn && fn(ac)
                }
                return true;
            })
        }
    }

    /**
     * 当天排行
     * @param body
     * @returns {Promise<void>}
     */
    async topDay(body = {}) {
        let res = await Ajax('get', '/question/qmm/topa', body);
        if (res.status) {
            return res.data;
        } else {
            alert('请稍后重试！');
            throw 'server error';
        }
    }

    /**
     * 历史排行
     * @param body
     * @returns {Promise<void>}
     */
    async topHistory(body = {}) {
        let res = await Ajax('get', '/question/qmm/topah', body);
        if (res.status) {
            return res.data;
        } else {
            alert('请稍后重试！');
            throw 'server error';
        }
    }

    getList() {
        let accountListRef = window.document.querySelector("#account_list");
        if (this.list instanceof Array && this.list.length) {
            let li = ``;
            this.list.every(l => {
                li += `
                    <li>
                        <a href="javascript:;" class="list flex">
                            <div class="indexs">
                                ${l.rownum}
                            </div>
                            <div class="user_img">
                                <img src="static/img/touxiang.png" alt="">
                            </div>
                            <p class="name">${l.nickname}</p>
                            <span class="num">￥${l.money}</span>
                        </a>
                    </li>
                `
                return true;
            })
            accountListRef.innerHTML = `<ul class="account_list">${li}</ul>`
        }
    }
}

/**
 * 路由监听
 */
let questioning
let homeInit
router.changeEvent.subscribe((data) => {
    switch (data.path) {
        case 'home':
            homeInit = new HomeInit();
            break;
        case 'list':
            new ListInit();
            console.info('list');
            break;
        case 'rule':
            console.info('rule');
            break;
        case 'count':
            new CountInit();
            break;
        case 'dati':
            questioning = new Questioning();
            break;
    }
});

router.destroyEvent.subscribe(data => {
    if (!data) return;
    switch (data.path) {
        case 'home':
            console.info('home');
            break;
        case 'list':
            console.info('list');
            break;
        case 'rule':
            console.info('rule');
            break;
        case 'count':
            console.info('count');
            break;
        case 'dati':
            questioning && questioning.destroy();
            questioning = null;
            break;
    }
});
