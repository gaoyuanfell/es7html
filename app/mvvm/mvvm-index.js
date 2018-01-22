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

    compileElement(ref) {
        let childNodes = ref.childNodes;
        if (!childNodes.length) return;
        Array.from(childNodes).every(node => {
            let text = node.textContent;
            if (node.nodeType === 1) {
                for (let a = 0; a < node.attributes.length; a++) {
                    let attr = node.attributes.item(a);
                    //事件
                    if (this.eventReg.test(attr.nodeName)) {
                        this.compileEvent(node, attr)
                    }
                    //属性
                    if (this.attrReg.test(attr.nodeName)) {
                        this.compileAttr(node, attr);

                        this.dep.add(() => {
                            this.compileAttr(node, attr)
                        })
                    }
                }
            }
            //绑值表达式 {{}} /\s*(\.)\s*/
            if (node.nodeType === 3 && this.valueReg.test(text)) {
                node.$textContent = node.textContent.replace(/\s*(\.)\s*/, '.');
                this.compileText(node);

                this.dep.add(() => {
                    this.compileText(node)
                })

            }
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
            return true;
        })
    }

    compileText(node) {
        let textContent = node.$textContent;
        let values = textContent.match(new RegExp(this.valueReg, 'ig'));
        values.every(va => {
            textContent.replace(va, value => {
                let t = value.match(this.valueReg);
                textContent = textContent.replace(t[0], this.spot(this.vm, t[1]) || String())
            });
            return true;
        });
        node.textContent = textContent;
    }

    compileEvent(node, attr) {
        let event = attr.nodeName.match(this.eventReg)[1];
        switch (event) {
            case 'model':
                node.oninput = (event) => {
                    let egx = attr.nodeValue.trim().replace(/\s*(\.)\s*/, '.');
                    this.setSpotValue(this.vm, egx, event.target.value);
                };
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
                        return this.attrValue(m);
                    });
                    if (this.vm[f]) {
                        this.vm[f](...args)
                    } else {
                        throw `${this.vm.constructor.name} class not find ${f}`
                    }
                };
        }
    }

    compileAttr(node, attr) {
        let event = attr.nodeName.match(this.attrReg)[1];
        let egx = attr.nodeValue.trim().replace(/\s*(\.)\s*/, '.');
        console.info(event)
        switch (event) {
            case '(model)':
                node.value = this.spot(this.vm, egx);
                break;
            case 'model':
                node.value = this.spot(this.vm, egx);
                break;
            case 'value':
                if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
                    break;
                }
            default:
                let attrs = event.split(/\./);
                let attrValue = this.attrValue(egx);
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
                            if(val){
                                node.style[attrs[1]] = val;
                            }else{
                                node.style.removeProperty(attrs[1])
                            }
                            break;
                    }
                }
        }
    }

    attrValue(str) {
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
        return this.spot(this.vm, str);
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

class Test {
    a = 1;
    b = 2;
    c = 3;
    d = 4;

    f = {a: 666}

    test(event) {
        console.info(event)
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


new MVVM("#body", new Test());
