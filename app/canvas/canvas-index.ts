let canvas = <HTMLCanvasElement>document.getElementById('tutorial')
let ctx = canvas.getContext('2d')

function demo1() {
    ctx.fillStyle = 'red';
    ctx.fillRect(50, 50, 200, 200);

    ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
    ctx.fillRect(200, 200, 100, 100)
}

// demo1()

function demo2() {
    ctx.fillRect(50, 50, 200, 200);
    ctx.clearRect(80, 80, 80, 80)
    ctx.strokeRect(90, 90, 40, 40)
}

// demo2()

function demo3() {
    ctx.beginPath();
    ctx.moveTo(75, 50);
    ctx.lineTo(100, 75);
    ctx.lineTo(100, 25);
    ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
    ctx.fill();
}

// demo3();

function demo4() {
    ctx.beginPath()
    ctx.arc(175, 175, 50, 0, Math.PI * 2, true); // 绘制
    ctx.moveTo(210, 175);
    ctx.arc(175, 175, 35, 0, Math.PI, false);   // 口(顺时针)
    ctx.moveTo(165, 165);
    ctx.arc(160, 165, 5, 0, Math.PI * 2, true);  // 左眼
    ctx.moveTo(195, 165);
    ctx.arc(190, 165, 5, 0, Math.PI * 2, true);  // 右眼
    ctx.stroke()
    ctx.closePath()
}

// demo4()

function demo5() {
    ctx.beginPath();
    ctx.moveTo(25, 25);
    ctx.lineTo(105, 25);
    ctx.lineTo(25, 105);
    ctx.fill();
}

// demo5()

function demo6() {
    ctx.beginPath();
    ctx.moveTo(125, 125);
    ctx.lineTo(125, 45);
    ctx.lineTo(45, 125);
    ctx.closePath();
    ctx.stroke();
}

// demo6()

function demo7() {
    ctx.beginPath();
    ctx.moveTo(75, 0);
    ctx.quadraticCurveTo(0, 0, 0, 75);
    ctx.quadraticCurveTo(0, 150, 75, 150);
    // ctx.moveTo(75,150);
    ctx.quadraticCurveTo(150, 150, 150, 75);
    ctx.quadraticCurveTo(150, 0, 75, 0);
    ctx.strokeStyle = '#000'
    ctx.stroke();
    ctx.fillStyle = 'red'
    ctx.fill()
}

// demo7();

function demo8() {
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
            ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ',' + Math.floor(255 - 42.5 * j) + ',0)';
            ctx.fillRect(j * 25, i * 25, 25, 25);
        }
    }
}

// demo8()

function fillText() {
    ctx.font = "48px serif";
    ctx.fillText("Hello world", 500, 50);
    ctx.font = "48px serif";
    ctx.strokeText("Hello world", 10, 50);
}

// fillText()

// fontSize fontFamily color text x y
function text(options) {
    ctx.font = `${options.fontSize || '12'}px ${options.fontFamily || 'serif'}`;
    ctx.fillText(options.text, options.x, options.y);
}

document.getElementById('title').addEventListener('input', (event: any) => {
    text({
        fontSize: 24,
        fontFamily: 'serif',
        x: 10,
        y: 24,
        text: event.target.value
    })
})

function demo9() {
    let img = new Image();
    img.onload = () => {
        let width = img.width;
        let height = img.height;

        let w = ctx.canvas.width;
        let h = ctx.canvas.height;

        console.info(ctx.canvas.width);

        ctx.drawImage(img, 0, 0, img.width / 8, img.height / 8);
        console.info(img)
    }
    img.src = 'static/img/1.jpg'
}

// demo9();
// let raf;
// let ball = {
//     x: 100,
//     y: 100,
//     vx: 5,
//     vy: 2,
//     radius: 25,
//     color: 'blue',
//     draw: function() {
//         ctx.beginPath();
//         ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
//         ctx.closePath();
//         ctx.fillStyle = this.color;
//         ctx.fill();
//     }
// };
//
// function draw() {
//     ctx.clearRect(0,0, canvas.width, canvas.height);
//     ball.draw();
//     ball.vy *= .99;
//     ball.vy += .25;
//     ball.x += ball.vx;
//     ball.y += ball.vy;
//     if (ball.y + ball.vy > canvas.height || ball.y + ball.vy < 0) {
//         ball.vy = -ball.vy;
//     }
//     if (ball.x + ball.vx > canvas.width || ball.x + ball.vx < 0) {
//         ball.vx = -ball.vx;
//     }
//     raf = window.requestAnimationFrame(draw);
// }
//
//
// canvas.addEventListener('mouseover', function(e){
//     raf = window.requestAnimationFrame(draw);
// });
//
// canvas.addEventListener('mouseout', function(e){
//     window.cancelAnimationFrame(raf);
// });
//
// ball.draw();

function demo10() {
    let img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
        // img.style.display = 'none';
    }
    img.src = 'static/img/1.jpg'

    var color = document.getElementById('color');
    function pick(event) {
        var x = event.layerX;
        var y = event.layerY;
        var pixel = ctx.getImageData(x, y, 1, 1);
        console.info(pixel)
        var data = pixel.data;
        var rgba = 'rgba(' + data[0] + ',' + data[1] +
            ',' + data[2] + ',' + (data[3] / 255) + ')';
        color.style.background =  rgba;
        color.textContent = rgba;
    }
    canvas.addEventListener('mousemove', pick);

}

demo10();
