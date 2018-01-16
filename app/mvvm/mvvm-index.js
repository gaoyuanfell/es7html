export class Compile {
    constructor(id, value) {
        if (!id) throw `dom节点不能为空`;
        if (!value) throw `值不能为空`;
        this.vm = value;
        this.ref = id;
        if (!(this.ref instanceof Element)) {
            this.ref = window.document.querySelector(`${this.ref}`)
        }
        this.ref.style.display = 'none';
        this.compileElement(this.ref);
        this.ref.style.display = 'block';
    }

    ref;
    vm;

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
                this.compileText(node)
            }
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
            return true;
        })
    }

    compileText(node) {
        let values = node.textContent.match(new RegExp(this.valueReg, 'ig'));
        values.every(va => {
            node.textContent.replace(va, (value, index, target) => {
                let t = value.match(this.valueReg);
                node.textContent = node.textContent.replace(t[0], this.vm[t[1]])
            });
            return true;
        })
    }

    compileEvent(node, attr) {
        let event = attr.nodeName.match(this.eventReg)[1];
        node[`on${event}`] = (event) => {
            console.info(attr.nodeValue);
        };
    }

    compileAttr(node, attr) {
        let event = attr.nodeName.match(this.attrReg)[1];
        console.info(event)
    }
}

class Test {
    a = 1;
    b = 2;
    c = 3;
    d = 4;

    test(event) {
        console.info(event)
    }
}

new Compile("#body", new Test());
