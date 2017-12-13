function array(array) {
    for (var a = 0; a < 5000000000; a++) {

    }
    return array
}
onmessage = function (e) {

    var workerResult = array(e.data);
    postMessage(workerResult);
}
