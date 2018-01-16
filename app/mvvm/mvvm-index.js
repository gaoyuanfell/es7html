

function compileElement(el) {
    let childNodes = el.childNodes;
    Array.from(childNodes).every(node => {
        let text = node.textContent;
        if(node.nodeType === 1){
            console.dir(node)
        }else if(node.nodeType === 3 && /\{\{((?:.|\n)+?)\}\}/.test(text)){
            console.dir(node)
        }
        if (node.childNodes && node.childNodes.length) {
            compileElement(node);
        }
        return true;
    })
}

compileElement(document.body)
