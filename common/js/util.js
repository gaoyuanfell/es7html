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
    /**
     * 默认传输格式
     */
    return new Promise((resolve, reject) => {
        let xhr = new window.XMLHttpRequest();
        xhr.withCredentials = false;
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

        if ('baseUrl' in config) {
            url = (config.baseUrl || '') + url;
        } else {
            url = (Ajax.config.baseUrl || '') + url;
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

        let beforeSend = () => {
        };
        if (config.beforeSend) {
            beforeSend = config.beforeSend
        } else if (Ajax.config.beforeSend) {
            beforeSend = Ajax.config.beforeSend
        }
        beforeSend(xhr, body, config);

        for (let h of Ajax.config.headers.keys()) {
            if (!config.headers.has(h)) {
                config.headers.set(h, Ajax.config.headers.get(h))
            }
        }

        //提交数据body
        let data = '';
        if (config.headers.has('Content-Type')) {
            let ct = config.headers.get('Content-Type');
            if (!!~ct.indexOf("application/json")) {
                data = JSON.stringify(body);
            } else if (!!~ct.indexOf("application/x-www-form-urlencoded")) {
                data = new URLSearchParams(body).toString();
            }
        }

        for (let h of config.headers.keys()) {
            xhr.setRequestHeader(h, config.headers.get(h));
        }

        if (method.toLocaleLowerCase() === 'post' && !config.headers.has('Content-Type')) {
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
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
        if (!(data.headers instanceof Headers)) {
            data.headers = new Headers(data.headers);
        }
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
    oldRoute;

    constructor(routes = [], config = {}) {
        Object.assign(this.config, config);
        this.routes = routes.map(r => {
            if (!(r.component instanceof Element) && !r.redirectTo) {
                let s = r.component;
                r.component = window.document.querySelector(`${s}`);
                r.$component = r.component.cloneNode(true);
                if (!r.component) throw `选择器：${s}不存在`;
                r.component.style.display = 'none';
                r.$component.style.display = 'none';
            }
            return r;
        });
        window.addEventListener('hashchange', () => {
            this.hashChange()
        });
        this.hashChange();
    }

    changeEvent = new $subject();
    destroyEvent = new $subject();

    hashChange() {
        let hash = Router.getHash();
        if (this.route && this.route.component) {
            let p = this.route.$component.cloneNode(true)
            this.route.component.parentNode.replaceChild(p, this.route.component)
            this.route.component = p;
            // this.route.component.style.display = 'none';
        }
        this.routes.every(r => {
            if (r.redirectTo && r.path === hash) {
                hash = r.redirectTo;
            }
            if (r.path === hash) {
                this.oldRoute = this.route
                this.route = r;
                return false;
            }
            return true;
        });
        if (this.route && this.route.component) {
            let p = this.route.$component.cloneNode(true)
            this.route.component.parentNode.replaceChild(p, this.route.component)
            this.route.component = p;
            this.route.component.style.display = 'block';
            this.changeEvent.next(this.route);
            this.destroyEvent.next(this.oldRoute)
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

export function Base64() {

    // private property
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // public method for encoding
    this.encode = function (input) {
        let output = "";
        let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        let i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    }

    // public method for decoding
    this.decode = function (input) {
        let output = "";
        let chr1, chr2, chr3;
        let enc1, enc2, enc3, enc4;
        let i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = _utf8_decode(output);
        return output;
    }

    // private method for UTF-8 encoding
    _utf8_encode = function (string) {
        string = string.replace(/\r\n/g, "\n");
        let utftext = "";
        for (let n = 0; n < string.length; n++) {
            let c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }
        return utftext;
    }

    // private method for UTF-8 decoding
    _utf8_decode = function (utftext) {
        let string = "";
        let i = 0;
        let c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}
