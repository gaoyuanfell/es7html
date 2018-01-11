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

export function Ajax(method, url, body = {}, config = {}) {
    return new Promise((resolve, reject) => {
        let xhr = new window.XMLHttpRequest();
        xhr.onerror = function (error) {

        }
        xhr.onreadystatechange = function (data) {
            let readyState = xhr.readyState;
            if (readyState === 4) {

                if (xhr.status === 200) {
                    let headers = xhr.getAllResponseHeaders();
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
                } else {
                    timeout && clearTimeout(timeout);
                    reject();
                }
            }
        };
        //GET请求参数
        if (method.toLocaleLowerCase() === 'get') {
            let bo = -1 === url.indexOf('?');
            if (bo) {
                url += `?_=${+new Date()}`;
            } else {
                url += `&_=${+new Date()}`;
            }

            let d = toBodyString(body);

            if (d) {
                url += '&' + d;
            }
        }

        xhr.open(method, url, true);
        //表头
        let headers = config.headers;
        let _headers;
        if (headers) {
            _headers = {};
            for (let h in headers) {
                _headers[h.toLocaleLowerCase()] = headers[h];
                xhr.setRequestHeader(h, headers[h]);
            }
        }
        //提交数据body
        let data = '';
        if (_headers) {
            let hs = Object.keys(_headers);
            let bo = !!~hs.map(d => d.toLocaleLowerCase()).indexOf('content-type');
            if (bo) {
                let value = _headers['content-type'];
                if (!!~value.indexOf("application/json")) {
                    data = JSON.stringify(body);
                } else if (!!~value.indexOf("application/x-www-form-urlencoded")) {
                    data = toBodyString(body);
                }
            }
        }

        xhr.send(data);
        let timeout = setTimeout(() => {
            reject()
            xhr.abort();
        }, 5000)
    })
}

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

    constructor(routes = [], config = {}) {
        Object.assign(this.config, config);
        this.routes = routes.map(r => {
            if (!(r.component instanceof Element)) {
                r.component = window.document.querySelector(`#${r.component}`);
                r.component.style.display = 'block';
            }
            return r;
        });
        window.addEventListener('hashchange', () => {
            this.hashChange()
        });
        this.hashChange();
    }

    hashChange() {
        let hash = Router.getHash();
        this.routes.forEach(r => {
            r.component.style.display = 'none';
            if (r.path === hash) r.component.style.display = 'block';
        })
    }

    static getHash() {
        let hash = self.location.hash;
        let index = hash.indexOf("?");
        if (~index) {
            return hash.substr(1, index - 1)
        }
        return hash.substr(1)
    }
}

/**
 *
 * @param selector 选择器 弹框的选择器
 * @param target:Array<string> 控制的选择器
 */
export function triggerClose(selector,target) {
    let selectorRef = window.document.querySelector(selector);
    if(!selectorRef) return;
    if(target instanceof Array){
        target.forEach(s => {
            let sRef = window.document.querySelector(s);
            if(sRef){
                sRef.addEventListener('click',()=> {
                    if(selectorRef.style.display === '' || selectorRef.style.display === 'none'){
                        selectorRef.style.display = 'block';
                    }else{
                        selectorRef.style.display = 'none';
                    }
                })
            }
        })
    }
}
