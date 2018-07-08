let tutorial = <HTMLCanvasElement>document.getElementById('tutorial')
let ctx = tutorial.getContext('2d')

function demo1(){
    ctx.fillStyle = 'red';
    ctx.fillRect(50, 50, 200, 200);

    ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
    ctx.fillRect(200, 200, 100, 100)
}

// demo1()

function demo2() {
    ctx.fillRect(50, 50, 200, 200);
    ctx.clearRect(80,80,80,80)
    ctx.strokeRect(90,90,40,40)
}

// demo2()

function demo3() {
    ctx.beginPath();
    ctx.moveTo(75,50);
    ctx.lineTo(100,75);
    ctx.lineTo(100,25);
    ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
    ctx.fill();
}

demo3();
