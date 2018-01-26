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
            Array.from(node.attributes).every(attr => {
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
                    node.removeAttribute(attr.nodeName)
                }

                //模板 *for
                if (attr.nodeName === '*for') {
                    this.compileFor(node,attr);
                }
                return true;
            })
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
            let data = Object.create(this.vm.__proto__);
            data[d] = a;
            data[e] = b;
            this.compileNode(copy, data);
        });
        node.parentNode.removeChild(node);
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
                let val = this.isBooleanValue(this.compileFun(t[1],vm));
                textContent = textContent.replace(t[0], val)
            });
            return true;
        });
        node.textContent = textContent;
    }

    compileFun(exg, vm){
        let fun = new Function('vm',`
            with(vm){return eval("${exg.replace(/'/g, '\\\'').replace(/"/g,'\\\"')}")}
        `);
        return fun(vm);
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
                                this.compileFun(`${attr.nodeValue}='${event.target.value}'`,vm)
                            };
                            break;
                        case 'textarea':
                            node.oninput = (event) => {
                                this.compileFun(`${attr.nodeValue}='${event.target.value}'`,vm)
                            };
                            break;
                        case 'checkbox':
                            node.onchange = (event) => {
                                this.compileFun(`${attr.nodeValue}=${event.target.checked}`,vm)
                            };
                            break;
                        case 'radio':
                            node.onchange = (event) => {
                                this.compileFun(`${attr.nodeValue}='${event.target.value}'`,vm)
                            };
                            break;
                    }
                }
                break;
            default:
                node[`on${event}`] = (event) => {
                    vm.__proto__.$event = event;
                    this.compileFun(attr.nodeValue,vm);
                    Reflect.deleteProperty(vm.__proto__,'$event');
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

    cssStyle2DomStyle(sName) {
        return sName.replace(/^\-/, '').replace(/\-(\w)(\w+)/g, function (a, b, c) {
            return b.toUpperCase() + c.toLowerCase();
        });
    }

}

class Dep {
    constructor() {
    }
    subs = [];

    add(sub) {
        this.subs.unshift(sub);
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
        this.def(this.vm)
    }

    vm;
    ref;
    dep;

    def(data){
        if (!data || typeof data !== 'object') {
            return;
        }

        if(data instanceof Array){

        }else{
            Object.keys(data).forEach(key => {
                this.def(data[key]);
                data[`_${key}`] = data[key];
                Object.defineProperty(data, key, {
                    get: () => {
                        return data[`_${key}`]
                    },
                    set: (val) => {
                        this.def(val);
                        data[`_${key}`] = val;
                        this.dep.notify()
                    }
                })
            })
        }
    }
}


class Test {
    constructor() {
        this.a = 500;
        this.b = 2;
        this.c = 3;
        this.d = 4;
        this.e = false;
        this.g = void 0;
        this.h = 'aaa';
        this.list = [
            1,2,3,4,5,6,7,8,9,10
        ];
        this.list2 = [
            {id: 1, name: '一'},
            {id: 2, name: '二'},
            {id: 3, name: '三'},
            {id: 4, name: '四'},
            {id: 5, name: '五'},
        ];
        new MVVM("#body", this);

        setTimeout(()=> {
            console.info(this.list2[0])
        },3000)

        document.body.innerText
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


    str(){
        return '11111'
    }

    bo(b){
        return b;
    }
}

new Test();
