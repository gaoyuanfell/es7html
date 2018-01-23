export class Compile {
    constructor(ref, value, dep) {
        this.vm = value;
        this.ref = ref;
        this.dep = dep;
        this.ref.style.display = 'none';
        this.compileElement(this.ref);
        this.ref.style.display = 'block';
    }

    ref;
    vm;
    dep;

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
            for (let a = 0; a < node.attributes.length; a++) {
                let attr = node.attributes.item(a);
                //事件
                if (this.eventReg.test(attr.nodeName)) {
                    this.compileEvent(node, attr, vm)
                }
                //属性
                if (this.attrReg.test(attr.nodeName)) {
                    this.compileAttr(node, attr, vm);

                    this.dep.add(() => {
                        this.compileAttr(node, attr, vm)
                    })
                }

                //模板 *if
                if (attr.nodeName === '*if') {
                    this.compileIf(node, attr, vm);
                    this.dep.add(() => {
                        this.compileIf(node, attr, vm)
                    })
                }

                //模板 *for
                if (attr.nodeName === '*for') {
                    this.compileFor(node,attr);
                }
            }
        }

        //绑值表达式 {{}} /\s*(\.)\s*/
        if (node.nodeType === 3 && this.valueReg.test(text)) {
            node.$textContent = node.textContent.replace(/\s*(\.)\s*/, '.');
            this.compileText(node, vm);
            this.dep.add(() => {
                this.compileText(node, vm)
            })
        }
        if (node.childNodes && node.childNodes.length && !~Array.from(node.attributes).map(attr => attr.nodeName).indexOf('*for')) {
            this.compileElement(node, vm);
        }
        return true;
    }

    getForFun(exg) {
        let exgs = exg.split(/;/);
        console.info(exgs);
        let vs;
        let is = undefined;
        if(exgs instanceof Array && exgs.length){
            vs = exgs[0].match(/let\s+(.*)\s+of\s+(.*)/);
            let index = exgs[1].match(/let\s+(.*)\s?=\s?index/);
            if(index instanceof Array && index.length){
                is = index[1].trim();
            }
        }
        return new Function('vm', `
            return function (fn) {
                for (let ${vs[1]} of vm.${vs[2]}){
                    fn && fn(${vs[1]}, vm.${vs[2]}.indexOf(${vs[1]}), vm, '${vs[1]}', '${is}')
                }
            }
        `)
    }

    compileFor(node, attr) {
        node.style.display = 'none';
        this.getForFun(attr.nodeValue)(this.vm)((a, b, c, d, e) => {
            let copy = node.cloneNode(true);
            copy.attributes.removeNamedItem('*for');
            copy.style.removeProperty('display');
            if(!copy.getAttribute('style')) copy.removeAttribute('style');
            node.parentNode.insertBefore(copy,node);
            let data = Object.create({[d]:a});
            data.__proto__[e] = b;
            this.compileNode(copy, data);
        });
        document.body.removeChild(node);
    }

    compileIf(node, attr, vm = this.vm) {
        let egx = attr.nodeValue.trim().replace(/\s*(\.)\s*/, '.');
        let bo = !!this.spot(vm, egx);
        node.style.display = bo ? 'block' : 'none';
    }

    compileText(node, vm = this.vm) {
        let textContent = node.$textContent;
        let values = textContent.match(new RegExp(this.valueReg, 'ig'));
        values.every(va => {
            textContent.replace(va, value => {
                let t = value.match(this.valueReg);
                textContent = textContent.replace(t[0], this.isBooleanValue(this.spot(vm, t[1])) || String())
            });
            return true;
        });
        node.textContent = textContent;
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
                        case 'text':
                            node.oninput = (event) => {
                                let egx = attr.nodeValue.trim().replace(/\s*(\.)\s*/, '.');
                                this.setSpotValue(vm, egx, event.target.value);
                            };
                            break;
                        case 'textarea':
                            node.oninput = (event) => {
                                let egx = attr.nodeValue.trim().replace(/\s*(\.)\s*/, '.');
                                this.setSpotValue(vm, egx, event.target.value);
                            };
                            break;
                        case 'checkbox':
                            node.onchange = (event) => {
                                let egx = attr.nodeValue.trim().replace(/\s*(\.)\s*/, '.');
                                this.setSpotValue(vm, egx, event.target.checked);
                            };
                            break;
                        case 'radio':
                            node.onchange = (event) => {
                                let egx = attr.nodeValue.trim().replace(/\s*(\.)\s*/, '.');
                                this.setSpotValue(vm, egx, event.target.value);
                            };
                            break;
                    }
                }
                break;
            default:
                node[`on${event}`] = (event) => {
                    let reg = /(.*)\(([^)]*)\)/;
                    let t = attr.nodeValue.match(reg);
                    let f = t[1];
                    let args = t[2].split(/\,/).map(m => {
                        m = m.trim()
                        let ms = m.split(/\./);
                        if (ms[0] === '$event') {
                            ms.shift();
                            if (ms.length) {
                                return this.spot(event, ms.join(/\./));
                            } else {
                                return event
                            }
                        }
                        return this.attrValue(m, vm);
                    });
                    if (this.vm[f]) {
                        this.vm[f](...args)
                    } else {
                        throw `${this.vm.constructor.name} class not find ${f}`
                    }
                };
        }
    }

    compileAttr(node, attr, vm = this.vm) {
        let event = attr.nodeName.match(this.attrReg)[1];
        let egx = attr.nodeValue.trim().replace(/\s*(\.)\s*/, '.');
        switch (event) {
            case '(model)':
            case 'model':
                if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
                    switch (node.type) {
                        case 'text':
                        case 'textarea':
                            node.value = this.spot(vm, egx);
                            break;
                        case 'checkbox':
                            node.checked = !!this.spot(vm, egx);
                            break;
                        case 'radio':
                            if (node.value == this.spot(vm, egx)) {
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
                let attrValue = this.attrValue(egx, vm);
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
    }

    attrValue(str, vm) {
        if (str === 'true') {
            return true;
        }

        if (str === 'false') {
            return false
        }

        if (/^(\'|\")(.*)(\"|\')$/.test(str)) {
            return str;
        }
        if (!isNaN(Number(str))) {
            return str;
        }
        return this.spot(vm, str);
    }

    spot(target, spotStr) {
        let sp = spotStr.split(/\./);
        let data = target;
        sp.every(a => {
            data = data[a];
            return data
        });
        return data;
    }

    setSpotValue(target, spotStr, value) {
        let sp = spotStr.split(/\./);
        let data = target;
        sp.forEach((s, i) => {
            if (i + 1 === sp.length) {
                data[s] = value;
            } else {
                data = data[s];
            }
        })
    }

    cssStyle2DomStyle(sName) {
        return sName.replace(/^\-/, '').replace(/\-(\w)(\w+)/g, function (a, b, c) {
            return b.toUpperCase() + c.toLowerCase();
        });
    }

}

class Dep {
    constructor() {
        this.id = Dep.uid++;
    }

    static uid = 0;
    id;
    subs = [];


    add(sub) {
        this.subs.push(sub);
    }

    remove(sub) {
        let index = this.subs.indexOf(sub);
        if (index !== -1) {
            this.subs.splice(index, 1);
        }
    }

    notify() {
        this.subs.forEach(sub => {
            if (sub instanceof Function) sub();
        });
    }
}

export class MVVM {
    constructor(id, value) {
        if (!id) throw `dom节点不能为空`;
        if (!value) throw `值不能为空`;
        this.vm = value;
        this.ref = id;
        this.dep = new Dep();
        if (!(this.ref instanceof Element)) {
            this.ref = window.document.querySelector(`${this.ref}`)
        }

        /**
         * 解析
         */
        new Compile(this.ref, this.vm, this.dep);

        /**
         * 值变更检测
         */
        Object.keys(this.vm).forEach(key => {
            this.vm[`_${key}`] = this.vm[key];
            Object.defineProperty(this.vm, key, {
                get: () => {
                    return this.vm[`_${key}`]
                },
                set: (val) => {
                    this.vm[`_${key}`] = val;
                    this.dep.notify()
                }
            })
        })
    }

    vm;
    ref
    dep;
}


class Test {
    constructor() {
        this.a = 500;
        this.b = 2;
        this.c = 3;
        this.d = 4;
        this.e = false;
        this.g = void 0;
        this.h = void 0;
        this.list = [
            {id: 1, name: '一'},
            {id: 2, name: '二'},
            {id: 3, name: '三'},
            {id: 4, name: '四'},
            {id: 5, name: '五'},
        ];
        new MVVM("#body", this);
    }

    f = {a: 666}

    test(event,index) {
        console.info(event)
        console.info(index)
    }

    change(event) {
        console.info(event)
    }

    input(event, a) {
        console.info(a)
        this.a = event.target.value
    }

    asd(event, b, s, num) {
        console.info(num);
    }
}

new Test();
