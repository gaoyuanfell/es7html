const h1Ref = document.querySelector('#h1');
const testRef = document.querySelector('#test');

h1Ref.innerHTML = new Date()
setInterval(() => {
    h1Ref.innerHTML = new Date()
}, 1000);

function b() {
    const fun = `
        onmessage = function(e) {
            function array(array) {
                for (var a = 0; a < 5000000000; a++) {
            
                }
                return array
            }
            var workerResult = array(e.data);
            postMessage(workerResult);
        }
    `;
    const blob = new Blob([fun], {type: 'application/javascript'});
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    worker.postMessage(1);
    return new Promise((r)=> {
        worker.onmessage = function (e) {
            r(e.data)
        };
    })
}

function a() {
    for (var a = 0; a < 5000000000; a++) {

    }
}

function c() {
    return new Promise((r)=> {
        setTimeout(()=> {
            for (var a = 0; a < 5000000000; a++) {

            }
            r()
        },0)
    })
}

document.querySelector('#a').addEventListener('click', () => {
    testRef.innerHTML = '开始执行';
    a();
    testRef.innerHTML = '结束执行';
})

document.querySelector('#b').addEventListener('click', () => {
    testRef.innerHTML = '开始执行';
    b().then(()=>{
        testRef.innerHTML = '结束执行';
    });
})

document.querySelector('#c').addEventListener('click', () => {
    testRef.innerHTML = '开始执行';
    c().then(()=>{
        testRef.innerHTML = '结束执行';
    });
})


function WorkerFactory() {

}

function sleep(time = 1000) {
    return new Promise((resolve, reject)=> {
        setTimeout(()=> {
            resolve()
        },time)
    })
}

async function asd() {
    await sleep();
    console.info('ok')
}
