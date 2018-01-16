import './css/style.less'
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('static/service-worker.js')
        .then(function () {
            console.log('Service Worker Registered');
        });
}

let iframeRef = window.document.querySelector('#iframe');

iframeRef.contentWindow.window.document.documentElement.innerHTML = `
    <html><head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta name="format-detection" content="telephone=no" /><meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no" /><title>
        公交查询	
        </title></head>
        <body border=0 margin=0 style="background:#ededf0;">
            <iframe src="//61.129.57.81:8181/BusEstimate.aspx" style="width:100%;height:200%;frameborder:0;border:0; scrolling:no;top:0;left:0" >
            </iframe>
        </body>
    </html>
`
