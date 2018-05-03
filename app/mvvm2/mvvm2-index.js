export class MVVM {
    constructor(id, value) {
        if (!id) throw `dom节点不能为空`;
        if (!value) throw `值不能为空`;
        this.vm = value;
        this.ref = id;
        if (!(this.ref instanceof Element)) {
            this.ref = window.document.querySelector(`${this.ref}`)
        }
        new Observe(this.vm);
        new Compile(this.ref, this.vm);
    }
}

export class Observe {
    constructor(data) {
        this.proxy(data);
    }

    proxy(data, dep = new Dep(1)) {
        if (!data || typeof(data) !== 'object') {
            return
        }
        if (data instanceof Array) {

            let arrayProto = Array.prototype;
            let arrayMethods = Object.create(arrayProto);
            [
                'push',
                'pop',
                'shift',
                'unshift',
                'splice',
                'sort',
                'reverse'
            ].forEach(method => {
                let original = arrayMethods[method];
                this.defValue(arrayMethods, method, () => {
                    let r = original.apply(this, arguments);
                    dep.notify()
                    return r;
                })
            });
            this.copyAugment(data, arrayMethods, Object.getOwnPropertyNames(arrayMethods))
            Object.keys(data).forEach(key =>
                this.defineReactive(data, key, data[key], dep)
            )
        } else {
            Object.keys(data).forEach(key =>
                this.defineReactive(data, key, data[key])
            )
        }
    }

    defineReactive(data, key, value, dep = new Dep(2)) {
        if (data && typeof(data) === 'object') {
            this.proxy(value, dep);
        }
        Object.defineProperty(data, key, {
            configurable: true,
            enumerable: false,
            get: function () {
                if (Dep.target) { // 往订阅器添加订阅者
                    dep.add(Dep.target)
                }
                return value
            },
            set: function (newValue) {
                if (value !== newValue) {
                    value = newValue;
                    dep.notify()
                }
            }
        })
    }

    defValue(obj, key, val, enumerable) {
        Object.defineProperty(obj, key, {
            value: val,
            enumerable: !!enumerable,
            configurable: true,
            writable: true,
            // get: function () {
            //     value = val
            //     if(typeof(val) === 'function' ){
            //         value = val();
            //     }
            // },
            // set: function (newValue) {
            //     if(value !== newValue){
            //         value = newValue
            //     }
            //     console.info(newValue)
            // }
        })
    }

    copyAugment(target, src, keys) {
        for (let i = 0, l = keys.length; i < l; i++) {
            let key = keys[i];
            this.defValue(target, key, src[key]);
        }
    }
}

export class Dep {
    constructor(name = 0) {
        this.subs = [];
        this.name = name
    }

    static target;
    subs;
    name

    add(sub) {
        this.subs.push(sub);
    }

    notify() {
        this.subs.forEach(function (sub) {
            sub.update()
        })
    }
}

export class Watcher {
    constructor(vm, exp, fn) {
        this.vm = vm;
        this.exp = exp;
        this.noop = fn;
        this.value = this.getValue();
    }

    vm;
    exp;
    noop;
    value;

    update() {
        this.run()
    }

    run() {
        this.noop && this.noop();
    }

    getValue() {
        Dep.target = this;
        const value = this.compileFun(this.exp, this.vm);
        Dep.target = null;
        return value
    }

    compileFun(exg, vm) {
        let fun = new Function('vm', `
            with(vm){return eval("${exg.replace(/'/g, '\\\'').replace(/"/g, '\\\"')}")}
        `);
        return fun(vm);
    }
}

export class Compile {
    constructor(ref, value) {
        this.vm = value;
        this.ref = ref;
        this.ref.style.display = 'none';
        this.compileElement(this.ref);
        this.ref.style.display = 'block';
    }

    ref;
    vm;

    eventReg = /\((.*)\)/;
    attrReg = /\[(.*)\]/;
    valueReg = /\{\{((?:.|\n)+?)\}\}/;

    compileElement(ref, vm = this.vm) {
        let childNodes = ref.childNodes;
        if (!childNodes.length) return;
        Array.from(childNodes).every(node => {
            return this.compileNode(node, vm);
        })
    }

    compileNode(node, vm = this.vm) {
        let text = node.textContent;
        if (node.nodeType === 1) {
            Array.from(node.attributes).every(attr => {
                //事件
                if (this.eventReg.test(attr.nodeName)) {
                    this.compileEvent(node, attr, vm)
                }
                //属性
                if (this.attrReg.test(attr.nodeName)) {
                    this.compileAttr(node, attr, vm);
                    new Watcher(vm, attr.nodeValue.trim(), () => { // 实例化订阅者
                        this.compileAttr(node, attr, vm)
                    });
                }

                //模板 *if
                if (attr.nodeName === '*if') {
                    this.compileIf(node, attr, vm);
                    new Watcher(vm, attr.nodeValue.trim(), () => { // 实例化订阅者
                        this.compileIf(node, attr, vm);
                    });
                    node.removeAttribute(attr.nodeName)
                }

                //模板 *for
                if (attr.nodeName === '*for') {
                    let comment = document.createComment(attr.nodeValue);
                    comment.$node = node;
                    node.parentNode.insertBefore(comment, node);
                    node.parentNode.removeChild(node);

                    let {nodes, exp} = this.compileFor(comment, attr);
                    console.info(nodes)
                    console.info(exp)
                    new Watcher(vm, exp, () => { // 实例化订阅者
                        debugger
                        this.compileFor(comment, attr, nodes);
                    });
                    // this.dep.add(() => {
                    //     this.compileFor(comment, attr, nodes);
                    // })
                }
                return true;
            })
        }

        //绑值表达式 {{}} /\s*(\.)\s*/
        if (node.nodeType === 3 && this.valueReg.test(text)) {
            let textContent = node.$textContent = node.textContent.replace(/\s*(\.)\s*/, '.');
            this.compileText(node, vm);

            let values = textContent.match(new RegExp(this.valueReg, 'ig'));
            values.forEach(val => {
                let exp = val.match(this.valueReg)[1]
                new Watcher(vm, exp.trim(), () => {
                    this.compileText(node, vm)
                });
            })
        }
        if (node.childNodes && node.childNodes.length && !~Array.from(node.attributes).map(attr => attr.nodeName).indexOf('*for')) {
            this.compileElement(node, vm);
        }
        return true;
    }

    getForFun(exg) {
        let exgs = exg.split(/;/);
        let vs;
        let is = undefined;
        if (exgs instanceof Array && exgs.length) {
            vs = exgs[0].match(/let\s+(.*)\s+of\s+(.*)/);
            if (exgs[1]) {
                let index = exgs[1].match(/let\s+(.*)\s?=\s?index/);
                if (index instanceof Array && index.length) {
                    is = index[1].trim();
                }
            }
        }
        return new Function('vm', `
            return function (fn) {
                for (let ${vs[1]} of vm.${vs[2]}){
                    fn && fn(${vs[1]}, vm.${vs[2]}.indexOf(${vs[1]}), vm, '${vs[1]}', ${is}, '${vs[2]}');
                }
            }
        `);
    }

    compileFor(comment, attr, arr = []) {
        let node = comment.$node;
        if (arr instanceof Array && arr.length) {
            arr.every(n => {
                comment.parentNode.removeChild(n);
                return true;
            });
            arr.length = 0;
        }
        let exp = null;
        this.getForFun(attr.nodeValue)(this.vm)((a, b, c, d, e, f) => {
            let copy = node.cloneNode(true);
            copy.removeAttribute('*for');
            copy.style.removeProperty('display');
            if (!copy.getAttribute('style')) copy.removeAttribute('style');
            comment.parentNode.insertBefore(copy, comment);
            arr.push(copy);

            let data = {};
            data[d] = a;
            if (e) {
                data[e] = b;
            }
            Object.setPrototypeOf(data, this.vm)
            exp = f;
            this.compileNode(copy, data);
        });
        return {
            nodes: arr,
            exp: exp
        };
    }

    compileIf(node, attr, vm = this.vm) {
        let bo = !!this.compileFun(attr.nodeValue, vm);
        node.style.display = bo ? 'block' : 'none';
    }

    compileText(node, vm = this.vm) {
        let textContent = node.$textContent;
        let values = textContent.match(new RegExp(this.valueReg, 'ig'));
        values.every(va => {
            textContent.replace(va, value => {
                let t = value.match(this.valueReg);
                let val = this.isBooleanValue(this.compileFun(t[1], vm));
                textContent = textContent.replace(t[0], val)
            });
            return true;
        });
        node.textContent = textContent;
    }

    compileFun(exg, vm) {
        let fun = new Function('vm', `
            with(vm){return eval("${exg.replace(/'/g, '\\\'').replace(/"/g, '\\\"')}")}
        `);
        return fun.bind(Object.getPrototypeOf(vm))(vm);
    }

    isBooleanValue(val) {
        switch (val) {
            case true:
                return String(true);
            case false:
                return String(false);
            case null:
                return String();
            case void 0:
                return String();
            default:
                return String(val)
        }
    }

    compileEvent(node, attr, vm = this.vm) {
        let event = attr.nodeName.match(this.eventReg)[1];
        switch (event) {
            case 'model':
                if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
                    switch (node.type) {
                        case 'number':
                            node.oninput = (event) => {
                                if (event.inputType === 'insertCompositionText') return;
                                this.compileFun(`${attr.nodeValue}='${parseInt(event.target.value)}'`, vm)
                            };
                            break;
                        case 'text':
                            node.oninput = (event) => {
                                if (event.inputType === 'insertCompositionText') return;
                                this.compileFun(`${attr.nodeValue}='${event.target.value}'`, vm)
                            };
                            break;
                        case 'textarea':
                            node.oninput = (event) => {
                                if (event.inputType === 'insertCompositionText') return;
                                this.compileFun(`${attr.nodeValue}='${event.target.value}'`, vm)
                            };
                            break;
                        case 'checkbox':
                            node.onchange = (event) => {
                                this.compileFun(`${attr.nodeValue}=${event.target.checked}`, vm)
                            };
                            break;
                        case 'radio':
                            node.onchange = (event) => {
                                this.compileFun(`${attr.nodeValue}='${event.target.value}'`, vm)
                            };
                            break;
                    }
                }
                break;
            default:
                node[`on${event}`] = (event) => {
                    vm.__proto__.$event = event;
                    this.compileFun(attr.nodeValue, vm);
                    Reflect.deleteProperty(vm.__proto__, '$event');
                };
        }
        node.removeAttribute(attr.nodeName)
    }

    compileAttr(node, attr, vm = this.vm) {
        let event = attr.nodeName.match(this.attrReg)[1];
        switch (event) {
            case '(model)':
            case 'model':
                if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
                    switch (node.type) {
                        case 'number':
                            node.value = this.compileFun(attr.nodeValue, vm);
                            break;
                        case 'text':
                        case 'textarea':
                            node.value = this.compileFun(attr.nodeValue, vm);
                            break;
                        case 'checkbox':
                            node.checked = !!this.compileFun(attr.nodeValue, vm);
                            break;
                        case 'radio':
                            if (node.value === String(this.compileFun(attr.nodeValue, vm))) {
                                node.checked = true;
                            }
                            break;
                    }
                }
                break;
            case 'value':
                if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
                    break;
                }
            default:
                let attrs = event.split(/\./);
                let attrValue = this.compileFun(attr.nodeValue, vm);
                if (attrs[0] in node && attrs.length === 1) {
                    node[attrs[0]] = attrValue;
                    break;
                }
                if (attrs.length >= 2) {
                    switch (attrs[0]) {
                        case 'attr':
                            node.setAttribute(attrs[1], attrValue);
                            break;
                        case 'class':
                            if (!!attrValue) {
                                node.classList.add(attrs[1]);
                            } else {
                                node.classList.remove(attrs[1]);
                            }
                            break;
                        case 'style':
                            let val = attrs[2] ? (attrValue ? (attrValue + attrs[2]) : '') : (attrValue || '');
                            if (val) {
                                node.style[attrs[1]] = val;
                            } else {
                                node.style.removeProperty(attrs[1])
                            }
                            break;
                    }
                }
        }
        node.removeAttribute(attr.nodeName)
    }
}


class Test {
    static ab = 1

    constructor() {
        this.a = 500;
        this.b = 2;
        this.c = 3;
        this.d = 4;
        this.e = false;
        this.g = void 0;
        this.h = 'aaa';
        this.list = [
            {a: 1},
        ];
        new MVVM("#body", this);

        setTimeout(() => {
            this.a = 600
            this.list.push({a: 11})
        }, 2000)
    }

    test(l) {
        console.info(this.a)
        console.info(l)
        this.list.push({a: 11})
    }

}

new Test();
