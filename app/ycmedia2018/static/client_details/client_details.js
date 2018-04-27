window.onload = function() {
    var imgbox = document.getElementById('imgbox');
    var list = document.getElementById('list');
    var prev = document.getElementById('prev');
    var next = document.getElementById('next');
    var index = 1;
    var timer;
    function animate(offset) {
        //获取的是style.left，是相对左边获取距离，所以第一张图后style.left都为负值，
        //且style.left获取的是字符串，需要用parseInt()取整转化为数字。
        var newLeft = parseInt(list.style.left) + offset;
        list.style.left = newLeft + 'px';
        //无限滚动判断
        if (newLeft > -254) {
            list.style.left = -1270 + 'px';
        }
        if (newLeft < -1270) {
            list.style.left = -254 + 'px';
        }
    }
    function play() {
        //重复执行的定时器
        timer = setInterval(function() {
            next.onclick();
        }, 2000)
    }

    function stop() {
        clearInterval(timer);
    }
    prev.onclick = function() {
        index -= 1;
        if (index < 1) {
            index = 5
        }
        animate(254);
    };

    next.onclick = function() {
        //由于上边定时器的作用，index会一直递增下去，我们只有5个小圆点，所以需要做出判断
        index += 1;
        if (index > 5) {
            index = 1
        }
        animate(-254);
    };
    imgbox.onmouseover = stop;
    imgbox.onmouseout = play;
    play();



    $('#yccm_client_return').on('click', function(){
        parent.layer.closeAll('iframe');
    })
}
