let canvas = <HTMLCanvasElement>document.getElementById('tutorial');
let canvas2 = <HTMLCanvasElement>document.getElementById('tutorial2');
let ctx = canvas.getContext('2d');
let ctx2 = canvas2.getContext('2d');

let titleRef = <HTMLInputElement>document.getElementById('title');
let describeRef = <HTMLInputElement>document.getElementById('describe');

titleRef.addEventListener('input', draw2);
describeRef.addEventListener('input', draw2);

document.getElementById('result').addEventListener('click', result)


function draw() {
    let img = new Image();
    img.onload = () => {
        let width = img.width;
        let height = img.height;

        let w = ctx.canvas.width;
        let h = ctx.canvas.height;

        if (width > height) {

        } else {
            let sx = 0;
            let sy = 0;
            let sWidth = width;
            let sHeight = height;
            let dx = 0;
            let dy = 0;
            let dWidth = w;
            let dHeight = w / width * height;
            ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        }
    }
    img.src = 'static/img/1.jpg'
}

draw();


function draw2() {
    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
    ctx2.font = "48px serif";
    ctx2.fillText(titleRef.value, 0, 48);
    ctx2.fillText(describeRef.value, 0, 96)
}

function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(function (blob) {
            resolve(blob)
        })
    })
}

function result() {
    let list = [canvas, canvas2]

    let _canvas = <HTMLCanvasElement>document.createElement('canvas')
    _canvas.width = 500;
    _canvas.height = 500;
    _canvas.style.display = 'none';
    document.body.appendChild(_canvas)
    let _ctx = _canvas.getContext('2d')
    list.every(li => {
        _ctx.drawImage(li, 0, 0)
        return true;
    })

    canvasToBlob(_canvas).then(blob => {
        let url = URL.createObjectURL(blob);
        let image = <HTMLImageElement>document.createElement('img');
        image.src = url;
        document.body.appendChild(image);
    })
}

let elementList = [
    {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        color: '#000',
        type: 'text',
        fontSize: 24,
        fontFamily: 'serif',
        value: 'XXX让你的旅行如此轻松',
        show: true,
    },
    {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        color: '#000',
        type: 'text',
        fontSize: 24,
        fontFamily: 'serif',
        value: '出境游,很难吗？',
        show: true,
    },
    {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        color: '#000',
        type: 'text',
        fontSize: 24,
        fontFamily: 'serif',
        value: 'SUMMER',
        show: true,
    }
]

let canvasBox = {
    width: 900,
    height: 400,
}

function init() {

}
