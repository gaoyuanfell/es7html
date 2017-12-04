import './css/index1.less'
import './css/base.less'
import '../../common/js/vendor'
import {Ajax, jsonp, sleep} from "../../common/js/util";

export const baseUrl = 'https://mall.lcinc.cn/api/v1/';

async function inserted(el) {
    let top = 0;
    let bo = true;
    while (bo) {
        ++top
        let height = el.clientHeight / el.children.length;
        if (top > height) {
            let f = el.firstElementChild;
            let l = el.lastElementChild;
            el.insertBefore(f, l.nextSibling);
            top = 0;
        }
        el.style.top = `-${top}px`;
        await sleep(80);
    }
}


function a(i) {
    return `
    <li class="flex" >
        <p class="left"><span>${i.user_name}</span>已成功领取</p>
        <p class="right">${i.phone_number}</p>
    </li>
`
}

jsonp(`${baseUrl}get/back_point_receive_list`).then(res => {
    if (res.status_code == 200) {
        let html = ''
        res.list.push(...res.list)
        res.list.forEach(d => {
            html += a(d);
        });
        let pointList = document.querySelector('#pointList')
        pointList.innerHTML = html;
        inserted(pointList);
    }
})

document.querySelector("#submit").addEventListener("click", (e) => {
    submit()
})

function submit() {
    let company_name = document.querySelector("#company_name").value
    let scope = document.querySelector("#scope").value
    let name = document.querySelector("#name").value
    let phone_number = document.querySelector("#phone_number").value


    if (!company_name) {
        alert('请输入公司名称');
        return;
    }
    if (!scope) {
        alert('请输入公司规模');
        return;
    }
    if (!name) {
        alert('请输入您的姓名');
        return;
    }
    if (!phone_number) {
        alert('请输入您的电话号码');
        return;
    }
    let reg = /^1[3-9]\d{9}$/;
    if (!reg.test(phone_number)) {
        alert("请填写正确的手机号！");
        return;
    }

    Ajax('post', `${baseUrl}add/message`, {
        company_name: company_name,
        scope: scope,
        name: name,
        phone_number: phone_number,
    }, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(res => {
        if(res.status_code == 200){
            alert("提交成功，工作人员稍后会与您取得联系")
            document.querySelector("#company_name").value = ""
            document.querySelector("#scope").value = ""
            document.querySelector("#name").value = ""
            document.querySelector("#phone_number").value = ""
        }
    });
}
