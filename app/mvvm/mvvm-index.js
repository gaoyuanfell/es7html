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
                        this.compileAttr(node, attr)
                    }
                }
            }
            //绑值表达式 {{}}
            if (node.nodeType === 3 && this.valueReg.test(text)) {
                let ts = node.textContent.match(new RegExp(this.valueReg, 'ig')).map(t => t.match(this.valueReg)[1]);
                node.$textContent = node.textContent;
                this.compileText(node)
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
                if (/^(\'|\")(.*)(\"|\')$/.test(m)) {
                    return m;
                }
                return this.spot(this.vm, m);
            });
            if (this.vm[f]) {
                this.vm[f](...args)
            } else {
                throw `${this.vm.constructor.name} class not find ${f}`
            }
        };
    }

    compileAttr(node, attr) {
        let event = attr.nodeName.match(this.attrReg)[1];
        console.info(event)
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
            sub.update();
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

    input(event) {
        console.info(event)
    }

    asd(event, b, s) {
        console.info(this);
        this.a = 5
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
                get: function(){
                    return this[`_${key}`]
                },
                set: function(val){
                    this[`_${key}`] = val;
                }
            })
        })

        console.info(this.vm.a)

        // this.vm.f.b = 777;
        //
        //
        // setTimeout(()=> {
        //     this.vm.f.b = 777
        // },2000)
    }

    vm;
    ref
    dep;
}


new MVVM("#body", new Test());
