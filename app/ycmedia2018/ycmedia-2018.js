import * as qs from "querystring";
import '../../common/js/vendor'
import '../../common/css/base.less'
import './css/index.less'
import {getHash} from "../../common/js/util";

hashChange();

window.addEventListener('hashchange', () => {
    hashChange()
});



let ref;
function hashChange() {
    if(ref) ref.style.display = 'none';
    let hash = getHash();
    if(!hash) return;
    ref = document.querySelector(`[data-type=${hash}]`);

    // if(hash == ref){
    //
    // }else {
    //
    // }
    if (ref) {
        ref.style.display = 'block';
        ref.animate([
            {opacity: 0},
            {opacity: 1}
        ], {
            duration: 500
        })
    }
}
const filtersRef = document.querySelector("#filters");
    filtersRef.addEventListener('click',(e) =>{
        Array.from(filtersRef.children).forEach(f =>{
            if(f.contains(e.target)){
                f.classList.add('active')
            }else {
                f.classList.remove('active')
            }
        })
    })


const head_list = document.getElementById("head_list");
const menu_content = document.getElementById("menu_content");
const oli = head_list.getElementsByTagName("li");//获取tab列表
const odiv = menu_content.getElementsByTagName("div");//获取tab内容列表
for (let i = 0; i < oli.length; i++) {
    oli[i].index = i;//定义index变量，以便让tab按钮和tab内容相互对应
    oli[i].onclick = function () {//移除全部tab样式和tab内容
        for (let i = 0; i < oli.length; i++) {
            oli[i].className = "";
            odiv[i].style.display = "none";
        }
        this.className = "active";//为当前tab添加样式
        odiv[this.index].style.display = "block";//显示当前tab对应的内容
    }
}

/*业务版块*/
var scrol=document.querySelector("#contentener");
var offSet = $('#guangcheng').offset().top;
// console.info(offSet);
scrol && scrol.addEventListener('scroll' , function(){
    var t = scrol.scrollTop;
    // console.info(t);
    if(t > offSet){
        $('.img1').addClass('animat1')
        $('.img2').addClass('animat2')
        $('.img3').addClass('animat3')
        $('.img4').addClass('animat4')
        $('.img5').addClass('animat5')
    }

})


/*案例中心*/
$('.yccm_client_case_group').on('click', function(){

    var hrefa = $(this).attr("data-href");
    var obj="../static/client_details/"+hrefa + '?_=' + Date.now();
    $(document.body).innerHeight()
    var width=$(document.body).outerWidth();
    layer.open({
        type: 2,
        title: false,
        shadeClose: true,
        shade: 0.9,
        area: [width+'px','100%'],
        content: obj //iframe的url
    });
});

/*关于银橙*/
const aboutRef = document.querySelector("#about_menu");
const aboutListRef = document.querySelector("#aboutlist");

aboutRef.addEventListener('click', (e) => {
    let fRef = null;
    Array.from(aboutRef.children).forEach(f => {
        f.classList.remove('active')
        if (f.contains(e.target)) {
            f.classList.add('active')
            fRef = f
        }
    })
    if (fRef && aboutListRef) {
        let type = fRef.dataset.type;
        if (+type) {
            Array.from(aboutListRef.children).forEach(p => {
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
        }
    }
});


/*关于银橙 招兵买马*/
function navList(id) {
    var $obj = $("#nav_dot"), $item = $("#J_nav_" + id);
    $item.addClass("on").parent().removeClass("none").parent().addClass("selected");
    $obj.find(".recommend").hover(function () {
        $(this).addClass("hover");
    }, function () {
        $(this).removeClass("hover");
    });
    $obj.find("p").hover(function () {
        if ($(this).hasClass("on")) { return; }
        $(this).addClass("hover");
    }, function () {
        if ($(this).hasClass("on")) { return; }
        $(this).removeClass("hover");
    });
    $obj.find(".recommend").click(function () {
        var $div = $(this).siblings(".list-item");
        if ($(this).parent().hasClass("selected")) {
            $div.slideUp(600);
            $(this).parent().removeClass("selected");
        }
        if ($div.is(":hidden")) {
            $("#nav_dot li").find(".list-item").slideUp(200);
            $("#nav_dot li").removeClass("selected");
            $(this).parent().addClass("selected");
            $div.slideDown(200);

        } else {
            $div.slideUp(200);
        }
    });
}
navList(1);

/*投资者关系*/

