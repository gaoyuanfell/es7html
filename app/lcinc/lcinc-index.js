import '../../common/css/base.less'
import './css/index.less'
import '../../common/js/vendor'

let zIndex = 1000

let navbar=document.getElementById("navbar-toggle");
let description_box=document.getElementById("description_box");
let item_box=document.getElementById("bomb_box")

navbar.addEventListener('click',()=>{
    if(description_box.classList.contains('blocks')){
        description_box.classList.remove('blocks');
    }else {
        description_box.classList.add('blocks');
    }
    if(item_box.classList.contains('blocks')){
        item_box.classList.remove('blocks');
    }else {
        item_box.classList.add('blocks');
    }
})
description_box.addEventListener('click',(e)=>{
    if(e.target.nodeName == 'DIV' && e.target.classList.contains('description_box')){
        item_box.classList.remove('blocks');
        description_box.classList.remove('blocks');
    }
})


/////////////////////////////////////////////////////////////////

hashChange()

window.addEventListener('hashchange', () => {
    hashChange()
    if(description_box.classList.contains('blocks')){
        description_box.classList.remove('blocks');
    }
    if(item_box.classList.contains('blocks')){
        item_box.classList.remove('blocks');
    }
});

function hashChange(){
    let hash = location.hash;
    let reg = hash.match(/(\d+)/);
    let home = document.getElementById("home");
    if (!reg) {
        home.style.display = 'block';
        home.style.zIndex = ++zIndex;
        home.animate([
            { opacity:0},
            { opacity:1}
        ], {
            duration:200
        })
        return;
    }
    let goods = document.getElementById("goods");
    let detail = document.getElementById("goods-detail");
    let n = document.getElementById("details");
    let index = reg[0];
    if (+index) {
        detail.style.display = 'block';
        detail.style.zIndex = ++zIndex;
        detail.animate([
            { opacity:0},
            { opacity:1}
        ], {
            duration:200
        })
        n.src = '../static/images/img' + index + '.jpg'
    }else{
        goods.style.display = 'block';
        goods.style.zIndex = ++zIndex;
        detail.animate([
            { opacity:1},
            { opacity:0}
        ], {
            duration:200
        })
    }
}

/*商品过滤*/
const filtersRef = document.querySelector("#filters");
const productListRef = document.querySelector("#product-list");

filtersRef.addEventListener('click', (e) => {
    let fRef = null;
    Array.from(filtersRef.children).forEach(f => {
        f.classList.remove('active')
        if (f.contains(e.target)) {
            f.classList.add('active')
            fRef = f
        }
    })
    if (fRef && productListRef) {
        let type = fRef.dataset.type;
        if (+type) {
            Array.from(productListRef.children).forEach(p => {
                p.style.display = 'none';
                if (p.dataset.type == type) {
                    p.style.display = 'block';
                    p.animate([
                        { opacity:0},
                        { opacity:1}
                    ], {
                        duration:500
                    })
                }
            })
        } else {
            Array.from(productListRef.children).forEach(p => {
                p.style.display = 'block';
                p.animate([
                    { opacity:0},
                    { opacity:1}
                ], {
                    duration:500
                })
            })
        }
    }
});
