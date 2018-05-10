import '../../common/css/base.less'
import './css/index.less'
import '../../common/js/vendor'
import {getHash} from "../../common/js/util";
hashChange();

window.addEventListener('hashchange', () => {
    hashChange()
});
function hashChange() {
    let refs = Array.from(document.querySelectorAll('[data-contentener]'));
    refs.every(ref => {
        ref.style.display = 'none';
        return true;
    });
    let hash = getHash();
    if (!hash) hash = 'home';
    let ref = refs.find(ref => ref.dataset.type === hash);
    if (ref) {
        ref.style.display = 'block';
        ref.animate([
            {opacity: 0},
            {opacity: 1}
        ], {
            duration: 250
        })
    }
}
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

/*
* 模板编译
* */
class Template {
    html
    value
    reg = /\{\{((?:.|\n)+?)\}\}/

    constructor(html, value) {
        this.html = html;
        this.value = value;
    }

    compileFun(exg) {
        let fun = new Function('vm', `
            with(vm){try {return eval("${exg.replace(/'/g, '\\\'').replace(/"/g, '\\\"')}")}catch (e) {return ''}}
        `);
        return fun(this.value);
    }

    compile() {
        this.html.match(new RegExp(this.reg, 'ig')).every(va => {
            this.html.replace(va, value => {
                let t = value.match(this.reg)
                let a = t[1].replace(/\s/ig, '').replace(/\s*(\.)\s*/, '.')
                let val = this.isBooleanValue(this.compileFun(a));
                this.html = this.html.replace(t[0], val)
            })
            return true;
        })
        return this.html;
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
}

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


~function () {
    let list = [
        {
            img: './static/images/tu1701.jpg',
            title: '拍拍贷',
            adds: '5000+',
            cost: '0.40 元',
            activation: '',
            rate: '2.50 %',
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },
        {
            img: './static/images/tu1702.jpg',
            title: '荒野行动',
            adds: '5000+',
            cost: '0.68 元',
            activation: '4.00 元',
            rate: '3%',
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },
        {
            img: './static/images/tu1703.jpg',
            title: 'KEEP',
            adds: '5000+',
            cost: '0.25元',
            activation: '5-6元',
            rate: '',
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },
        {
            img: './static/images/tu1704.jpg',
            title: '网易严选',
            adds: '5000+',
            cost: '0.58 元',
            activation: '',
            rate: '',
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },
        {
            img: './static/images/tu1705.jpg',
            title: '大众点评',
            adds: '5000+',
            cost: '0.55 元',
            activation: '6.00 元',
            rate: '10.00%',
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },

        {
            img: './static/images/tu1706.jpg',
            title: '网易考拉',
            adds: '5000+',
            cost: '0.30元',
            activation: '15元',
            rate: '',
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },
        {
            img: './static/images/tu1707.jpg',
            title: 'JJ斗地主',
            adds: '5000+',
            cost: '0.23元',
            activation: '3-6元',
            rate: '4.50%',
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },
        {
            img: './static/images/tu1708.jpg',
            title: '你我贷',
            adds: '5000+',
            cost: '0.70',
            activation: '8.00',
            rate: '6.00%',
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },
        {
            img: './static/images/tu1709.jpg',
            title: '恒源祥',
            adds: '5000+',
            cost: '0.70',
            activation: '8.00',
            rate: '6.00%',
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        },
        {
            img: './static/images/tu1707.jpg',
            title: '大集金服',
            adds: '5000+',
            cost: '0.70',
            activation: '8.00',
            rate: '6.00%',
            time: '2017年',
            target: '营销目标：通过智橙平台精准广告推送，高效传递品牌信息， 有效提升精准度和转化效果，为品牌带来更多有效用户。',
            platform: '智橙移动端'
        }
    ]
    let str = `
        <div class="yccm_client_case_group" data-index="{{$index}}">
            <p class="img"><img src="{{img}}"></p>
            <div class="yccm_client_case_text">{{title}}</div>
            <p class="yccm_client_case_timetext clear">
                <span style="display: {{costShow}}">CPC成本：{{cost}}</span>                           
                <span style="display: {{activationShow}}">激活成本：{{activation}}</span>
            </p>
            <p class="yccm_client_case_timetext clear">
                 <span style="display: {{rateShow}}">点击率：{{rate}}</span>
                 <span style="display: {{added}}">单日新增：{{adds}}</span> 
            </p>                            
            <a href="javascript:void(0);" class="link">查看详情&nbsp;&gt;</a>
        </div>
    `;

    let caseList = '';
    list.forEach((data, i) => {
        data.$index = i;
        if(!data.adds) data.added = 'none';
        if(!data.cost) data.costShow = 'none';
        if(!data.activation) data.activationShow = 'none';
        if(!data.rate) data.rateShow = 'none';
        caseList += new Template(str, data).compile();
    })
    document.querySelector('.yccm_popup_bodyText').innerHTML = caseList;

}()


