import './style.less'
import './vendor'

function sleep(time) {
    return new Promise((resolve,reject)=> {
        setTimeout(()=> {
            resolve()
        },time)
    })
}

async function asd() {
    await sleep(2000);
    console.info('ok');
    alert('ok')
}

asd().catch(()=> {});
