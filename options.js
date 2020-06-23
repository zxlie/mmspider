let el = document.querySelector('#closeOnSaved');

chrome.runtime.sendMessage({
    type: 'getOptions'
}, function (opt) {
    if (opt === 1) {
        el.checked = 'checked';
    }
});

el.onclick = function () {
    chrome.runtime.sendMessage({
        type: 'setOptions',
        content: this.checked ? 1 : 0
    });
};