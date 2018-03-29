import '../../common/css/base.less'
import './css/index.less'

window.addEventListener('load',function(){
    //初始化滑动插件
    var yc=new Swiper('.swiper-container',{
        direction : 'vertical',
        effect : 'slide',
        loop:true,
        onTransitionStart:function(obj){
        }
    });



});



