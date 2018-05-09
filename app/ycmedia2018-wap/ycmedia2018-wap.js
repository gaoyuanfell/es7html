import '../../common/css/base.less'
import './css/index.less'
import '../../common/js/vendor'


/*let navbar=document.getElementById("navbar-toggle");
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
})*/

/*顶部菜单渐变*/
let scrol = document.querySelector(".scroll-content");
let offSet = 100;
let aa = document.querySelector('.top');
scrol && scrol.addEventListener('scroll', function () {
    let t = scrol.scrollTop;
    if (t > offSet) {
        aa.className = 'top topbg'
    }else {
        aa.className = 'top'
    }
})

/**
 * 合作伙伴切换
 */
let ImageSwiper = function(imgs, minRange) {
    this.imgBox = imgs
    this.imgs = imgs.children
    this.cur_img = 1  //起始图片设为1 ,而非0,将在图片显示方法中作-1处理
    this.ready_moved = true  //判断每次滑动开始的标记变量
    this.imgs_count = this.imgs.length
    this.touchX  //触控开始的手指最初落点
    this.minRange = Number(minRange)
    this.fadeIn  //图片切换的方式,这里使用淡入淡出
    this.fadeOut
    this.bindTouchEvn() //初始化绑定滑动事件
    this.showPic(this.cur_img) //显示图片方法,注意其中图片编号的-1处理
}
ImageSwiper.prototype.bindTouchEvn = function() {
    this.imgBox.addEventListener('touchstart', this.touchstart.bind(this), false)
    // this.imgBox.addEventListener('touchmove', this.touchmove.bind(this), false)
    this.imgBox.addEventListener('touchend', this.touchend.bind(this), false)

}
ImageSwiper.prototype.touchstart = function(e) {
    if (this.ready_moved) {
        let touch = e.touches[0];
        this.touchX = touch.pageX;
        this.ready_moved = false;
    }
}

ImageSwiper.prototype.touchmove = function(e) {
    e.preventDefault();
    let minRange = this.minRange
    let touchX = this.touchX
    let imgs_count = this.imgs_count

    if (!this.ready_moved) {
        let release = e.changedTouches[0];
        let releasedAt = release.pageX;
        if (releasedAt + minRange < this.touchX) {
            this.ready_moved = true;
            if (this.cur_img > (imgs_count - 1)) {
                this.cur_img = 0;
            }
            this.cur_img++;
            this.showPic(this.cur_img);

        } else if (releasedAt - minRange > this.touchX) {
            if (this.cur_img <= 1) {
                this.cur_img = imgs_count + 1
            }
            this.cur_img--;
            this.showPic(this.cur_img);
            this.ready_moved = true;
        }
    }
}

ImageSwiper.prototype.touchend = function(e) {
    e.preventDefault();
    let minRange = this.minRange
    let touchX = this.touchX
    let imgs_count = this.imgs_count
    if (!this.ready_moved) {
        let release = e.changedTouches[0];
        let releasedAt = release.pageX;
        if (releasedAt + minRange < this.touchX) {
            this.ready_moved = true;
            if (this.cur_img > (imgs_count - 1)) {
                this.cur_img = 0;
            }
            this.cur_img++;
            this.showPic(this.cur_img);

        } else if (releasedAt - minRange > this.touchX) {
            if (this.cur_img <= 1) {
                this.cur_img = imgs_count + 1
            }
            this.cur_img--;
            this.showPic(this.cur_img);
            this.ready_moved = true;
        }
    }

}
//在样式表中设置好 .fadeIn 的透明度为0
ImageSwiper.prototype.fadeIn = function(e) {
    e.classList.add("fadeIn")
}

ImageSwiper.prototype.fadeOut = function(e) {
    Array.prototype.forEach.call(e, function(e) {
        e.className = "bg"
    })
}

ImageSwiper.prototype.showPic = function(cur_img) {
    this.hidePics(this.imgs)
//得到图片元素的真实索引
    let index = cur_img - 1
    if (this.imgBox.nextElementSibling.getElementsByClassName("on")[0]) {
        let active = this.imgBox.nextElementSibling.getElementsByClassName("on")[0];
        active.classList.remove("on")
    }
    console.log(this.cur_img)
    this.imgBox.nextElementSibling.querySelector(".dot_" + index).classList.add("on");
    console.info(this.imgs[index])
    this.fadeIn(this.imgs[index]);

}
ImageSwiper.prototype.hidePics = function(e) {
    this.fadeOut(e)

}
//传参
new ImageSwiper(document.querySelector('#imgs0'), 30)
new ImageSwiper(document.querySelector('#imgs1'), 30)
new ImageSwiper(document.querySelector('#imgs2'), 30)

let head_list = document.getElementById("head_list");
let oli = head_list.getElementsByTagName("span");//获取tab列表
let odiv = document.getElementById("menu_content").querySelectorAll(".menu_tu");

for(let i=0 ; i<oli.length ; i++){
    oli[i].index = i;//定义index变量，以便让tab按钮和tab内容相互对应
    oli[0].className ='active';
    oli[i].onclick = function(){
        for(let i =0; i < oli.length; i++){
            oli[i].className = "";
            odiv[i].style.display = "none";
        }
        this.className = "active";//为当前tab添加样式
        odiv[this.index].style.display="block";//显示当前tab对应的内容
    }
}





