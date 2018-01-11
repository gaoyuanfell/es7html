if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('static/service-worker.js')
        .then(function () {
            console.log('Service Worker Registered');
        });
}

import {Router} from '../../common/js/util'


new Router([
    {
        path: 'a',
        component: 'a'
    }, {
        path: 'b',
        component: 'b'
    }, {
        path: 'c',
        component: 'c'
    }
])
