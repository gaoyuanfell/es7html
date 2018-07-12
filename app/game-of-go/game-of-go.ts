let canvas = <HTMLCanvasElement>document.getElementById('tutorial');
let boxSize = 50;
let width = 860;
let height = 860;
let division = 45;
let lattice = (width - boxSize) / 45 + 1;

canvas.width = width;
canvas.height = height;
let ctx = canvas.getContext('2d');

ctx.translate(25, 25);

// 自己
let type = 1;
let chessBoard = [];
for (let x = 0; x < lattice; x++) {
    chessBoard[x] = [];
    for (let y = 0; y < lattice; y++) {
        chessBoard[x][y] = 0
    }
}

// 赢法数组
let wins = [];
let count = 0;
let over = false;

// 统计赢法
let myWin = []
let computerWin = []

for (let x = 0; x <= lattice; x++) {
    wins[x] = [];
    for (let y = 0; y <= lattice; y++) {
        wins[x][y] = [];
    }
}

for (let x = 0; x <= lattice; x++) {
    for (let y = 0; y <= lattice - 5; y++) {
        for (let k = 0; k < 5; k++) {
            wins[x][y + k][count] = true;
        }
        count++
    }
}

for (let x = 0; x <= lattice; x++) {
    for (let y = 0; y <= lattice - 5; y++) {
        for (let k = 0; k < 5; k++) {
            wins[y + k][x][count] = true;
        }
        count++
    }
}

for (let x = 0; x <= lattice - 5; x++) {
    for (let y = 0; y <= lattice - 5; y++) {
        for (let k = 0; k < 5; k++) {
            wins[x + k][y + k][count] = true;
        }
        count++
    }
}

for (let x = 0; x <= lattice - 5; x++) {
    for (let y = lattice - 1; y > 3; y--) {
        for (let k = 0; k < 5; k++) {
            wins[x + k][y - k][count] = true;
        }
        count++
    }
}

for (let i = 0; i < count; i++) {
    myWin[i] = 0;
    computerWin[i] = 0;
}


/**
 * 棋盘
 */
function checkerboard() {
    ctx.save();
    ctx.strokeStyle = '#BFBFBF';
    for (let i = 0; i < lattice; i++) {
        if (i === 0 || i === lattice - 1) {
            ctx.lineCap = 'square';
            ctx.lineWidth = 4
        } else {
            ctx.lineWidth = 1
        }
        ctx.beginPath();
        ctx.moveTo(i * division, 0);
        ctx.lineTo(i * division, width - boxSize);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(0, i * division);
        ctx.lineTo(width - boxSize, i * division);
        ctx.stroke();
        ctx.closePath()
    }
    ctx.restore();
}

/**
 * 棋盘关键点
 */
function emphasize() {
    ctx.save();
    for (let i = 0; i < lattice; i++) {
        if (i === 3 || i === 9 || i === 15)
            for (let y = 0; y < lattice; y++) {
                if (y === 3 || y === 9 || y === 15) {
                    ctx.beginPath();
                    ctx.arc(i * division, y * division, 6, 0, 2 * Math.PI, false);
                    ctx.fillStyle = '#000';
                    ctx.fill();
                    ctx.closePath()
                }
            }

    }
    ctx.restore();
}

/**
 * 黑白子
 * @param x
 * @param y
 * @param {number} type 1:黑子 2:白子
 */
function piece(x, y, type = 1) {
    let r = 20;
    ctx.beginPath();
    ctx.arc(x * division, y * division, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#000';
    let gradient = ctx.createRadialGradient(x * division + 2, y * division - 2, r / 2, x * division + 2, y * division - 2, 0);
    if (type === 1) {
        gradient.addColorStop(0, '#0A0A0A');
        gradient.addColorStop(1, '#636766');
    } else {
        gradient.addColorStop(0, '#D1D1D1');
        gradient.addColorStop(1, '#F9F9F9');
    }
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath()
}

checkerboard();
emphasize();

function computerAI(){
    let myScore = [];
    let computerScore = []
    let max = 0;
    let u = 0;
    let v = 0;
    for(let x = 0; x < lattice; x++){
        myScore[x] = [];
        computerScore[x] = [];
        for(let y = 0; y < lattice; y++){
            myScore[x][y] = 0;
            computerScore[x][y] = 0;
        }
    }

    for(let x = 0; x < lattice; x++){
        for(let y = 0; y < lattice; y++){
            if(chessBoard[x][y] === 0){
                for(let k = 0; k < count; k++){
                    if(wins[x][y][k]){
                        if(myWin[k] == 1){
                            myScore[x][y] += 200
                        }else if(myWin[k] == 2){
                            myScore[x][y] += 400
                        }else if(myWin[k] == 3){
                            myScore[x][y] += 2000
                        }else if(myWin[k] == 4){
                            myScore[x][y] += 10000
                        }

                        if(computerWin[k] == 1){
                            computerScore[x][y] += 220
                        }else if(computerWin[k] == 2){
                            computerScore[x][y] += 420
                        }else if(computerWin[k] == 3){
                            computerScore[x][y] += 2100
                        }else if(computerWin[k] == 4){
                            computerScore[x][y] += 20000
                        }
                    }
                }
                if(myScore[x][y] > max){
                    max = myScore[x][y]
                    u = x;
                    v = y;
                }else if(myScore[x][y] == max){
                    if(computerScore[x][y] > computerScore[u][v]){
                        u = x;
                        v = y;
                    }
                }

                if(computerScore[x][y] > max){
                    max = computerScore[x][y];
                    u = x;
                    v = y;
                }else if(computerScore[x][y] == max){
                    if(myScore[x][y] > myScore[u][v]){
                        u = x;
                        v = y;
                    }
                }
            }
        }
    }

    type = 2
    piece(u, v, type);
    chessBoard[u][v] = 2;
    for (let k = 0; k < count; k++) {
        if (wins[u][v][k]) {
            computerWin[k]++;
            myWin[k] = 6;
            if (computerWin[k] === 5) {
                setTimeout(() => {
                    alert('计算器赢了！')
                });
                over = true;
            }
        }
    }
    if(!over){
        type = 1;
    }
}

canvas.addEventListener('click', (event) => {
    if (over) return;
    if(type != 1) return
    let offsetX = event.offsetX;
    let offsetY = event.offsetY;

    let x = Math.floor(offsetX / division);
    let y = Math.floor(offsetY / division);

    if (chessBoard[x][y] === 0) {
        piece(x, y, type);
        chessBoard[x][y] = type;
        for (let k = 0; k < count; k++) {
            if (wins[x][y][k]) {
                myWin[k]++;
                computerWin[k] = 6;
                if (myWin[k] === 5) {
                    setTimeout(() => {
                        alert('你赢了！')
                    });
                    over = true;
                }
            }
        }
        if(!over){
            type = 2;
            computerAI()
        }
    }
});

function loadImg(url) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        let img = new Image()
        img.onload = () => {
            resolve(img);
        }
        img.src = url;
    })
}
