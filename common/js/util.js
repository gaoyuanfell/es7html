import * as qs from 'querystring';

let count = 0;

export function jsonp(url, body = {}, config = {}, fn) {
    function noop() {
    }

    let target = document.getElementsByTagName('script')[0] || document.head;

    let prefix = config.prefix || 'jsonp';
    let timeout = config.timer || 30000;
    let timer = null;

    let id = config.name || (prefix + (count++) + +new Date());

    body.callback = id;
    body._ = +new Date();

    url += url.indexOf('?') > -1 ? '&' : '?';
    url += qs.stringify(body);

    let script = document.createElement('script');
    script.src = url;
    target.parentNode.insertBefore(script, target);

    function cleanup() {
        if (script.parentNode) script.parentNode.removeChild(script);
        window[id] = noop;
        if (timer) clearTimeout(timer);
    }

    return new Promise((resolve, reject) => {
        window[id] = function (data) {
            if (data.status_code == 200 || data.status_code == 204) {
                resolve(data);
            } else if (data.status_code == 201) {
                reject("请登录！")
            } else if (data.status_code == 203) {
                reject(data)
            } else {
                reject(data.error_message)
            }
            fn && fn(data);
            cleanup();
        };

        if (timeout) {
            timer = setTimeout(function () {
                reject(new Error('Timeout'));
                timer = 0;
                cleanup();
            }, timeout);
        }
    })
}

export function Ajax(method, url, body = {}, config = {headers: new Headers()}) {
    if (!(config.headers instanceof Headers)) {
        config.headers = new Headers(config.headers);
    }
    Object.assign(Ajax.config, config);

    let headers = Ajax.config.headers;
    /**
     * 默认传输格式
     */
    headers.set('Content-Type', 'application/json;charset=UTF-8');
    return new Promise((resolve, reject) => {
        let xhr = new window.XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.onerror = function (error) {
            reject(error);
        }
        xhr.onreadystatechange = function (data) {
            let readyState = xhr.readyState;
            if (readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    let json;
                    let text = xhr.responseText;
                    try {
                        if (text.match(/\n/)) {
                            text = text.replace(/\n/g, '')
                        }
                        json = JSON.parse(text)
                    } catch (e) {
                        json = text;
                    }
                    timeout && clearTimeout(timeout);
                    resolve(json);
                } else if (xhr.status === 404) {
                    timeout && clearTimeout(timeout);
                    reject(xhr.status);
                } else {
                    timeout && clearTimeout(timeout);
                    reject();
                }
            }
        };

        if (Ajax.config.baseUrl) {
            url = Ajax.config.baseUrl + url;
        }

        //GET请求参数
        if (method.toLocaleLowerCase() === 'get') {
            let Url;
            try {
                Url = new URL(url);
            } catch (err) {
                url = location.protocol + url;
                Url = new URL(url);
            }
            let searchParams = Url.searchParams;
            for (let [k, v] of Object.entries(body)) {
                searchParams.set(k, v);
            }
            searchParams.set('_', String(+new Date()));
            url = Url.toString();
        }

        xhr.open(method, url, true);

        Ajax.config.beforeSend && Ajax.config.beforeSend(xhr, body, Ajax.config);

        //提交数据body
        let data = '';
        if (headers.has('Content-Type')) {
            let ct = headers.get('Content-Type');
            if (!!~ct.indexOf("application/json")) {
                data = JSON.stringify(body);
            } else if (!!~ct.indexOf("application/x-www-form-urlencoded")) {
                data = new URLSearchParams(body).toString();
            }
        }

        for (let h of headers.keys()) {
            xhr.setRequestHeader(h, headers.get(h));
        }

        xhr.send(data);
        let timeout = setTimeout(() => {
            reject();
            xhr.abort();
        }, 5000)
    })
}

Ajax.__proto__.config = {};
Ajax.configSetup = function (data) {
    if (data) {
        Ajax.__proto__.config = data;
    }
};

function toQueryPair(key, value, bo) {
    if (typeof value === 'undefined') {
        return key;
    }
    return key + '=' + (bo ? encodeURIComponent(value === null ? '' : String(value)) : value === null ? '' : String(value));
}

export const toBodyString = function (obj, bo = true) {
    let ret = [];
    for (let key in obj) {
        let values = obj[key];
        if (values && values.constructor === Array) { //数组
            let queryValues = [];
            for (let i = 0, len = values.length, value; i < len; i++) {
                value = values[i];
                queryValues.push(toQueryPair(key, value));
            }
            ret = ret.concat(queryValues);
        } else { //字符串
            ret.push(toQueryPair(key, values, bo));
        }
    }
    return ret.join('&');
}

export function sleep(time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    })
}

export function getHash() {
    let hash = location.hash;
    let index = hash.indexOf("?");
    if (~index) {
        return hash.substr(1, index - 1)
    }
    return hash.substr(1)
}

/**
 * routes:{
 *      path:'',
 *      component:''//当前dom或者ID选择器
 * }
 */
export class Router {

    config = {
        useHash: true
    };
    routes;

    route;

    constructor(routes = [], config = {}) {
        Object.assign(this.config, config);
        this.routes = routes.map(r => {
            if (!(r.component instanceof Element) && !r.redirectTo) {
                let s = r.component;
                r.component = window.document.querySelector(`#${s}`);
                if (!r.component) throw `ID：${s}不存在`;
                r.component.style.display = 'none';
            }
            return r;
        });
        window.addEventListener('hashchange', () => {
            this.hashChange()
        });
        this.hashChange();
    }

    changeEvent = new $subject();

    hashChange() {
        let hash = Router.getHash();
        if (this.route && this.route.component) {
            this.route.component.style.display = 'none';
        }
        this.routes.every(r => {
            if (r.redirectTo && r.path === hash) {
                hash = r.redirectTo;
            }
            if (r.path === hash) {
                this.route = r;
                return false;
            }
            return true;
        });
        if (this.route && this.route.component) {
            this.route.component.style.display = 'block';
            this.changeEvent.next(this.route);
        }
    }

    static getHash() {
        let hash = self.location.hash;
        let index = hash.indexOf("?");
        if (~index) {
            return hash.substr(1, index - 1)
        }
        return hash.substr(1)
    }

    navigate(path) {
        if (!path) throw 'path not find';
        let route = this.routes.find((r) => {
            if (r.path === path) {
                return r;
            }
        });
        if (!route) return;
        window.location.hash = `#${path}`
    }
}

/**
 * 弹窗的开关
 * @param selector 选择器 弹框的选择器
 * @param target:Array<string> 控制的选择器
 */
export function triggerClose(selector, target) {
    let closeBtn = [];
    let selectorRef = window.document.querySelector(selector);
    if (!selectorRef) return;
    if (target instanceof Array) {
        target.forEach(s => {
            let sRef = window.document.querySelector(s);
            closeBtn.push(sRef);
            if (sRef) {
                sRef.addEventListener('click', () => {
                    trigger();
                })
            }
        })
    }

    function trigger() {
        if (selectorRef.style.display === '' || selectorRef.style.display === 'none') {
            selectorRef.style.display = 'block';
        } else {
            selectorRef.style.display = 'none';
        }
    }

    return {
        layer: selectorRef,
        close: closeBtn,
        trigger: trigger
    }
}

/**
 * 订阅
 */
export class $subject {
    constructor() {

    }

    cacheList = [];

    next(data) {
        if (this.cacheList.length === 0) {
            this._cacheList.push(data);
            return;
        }
        this.cacheList.every(ca => {
            ca && ca(data);
        })
    }

    _cacheList = [];

    subscribe(fn) {
        if (this._cacheList.length > 0) {
            this._cacheList.every(da => {
                fn && fn(da);
            })
        }
        if (fn instanceof Function) {
            this.cacheList.push(fn);
        }
    }
}
