/**
 * 脉脉详情页信息抓取工具
 *
 * @author 阿烈叔
 * @date 2018-06-06
 */

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, function (tabs) {
        let isOpened = false;
        let tabId;
        let reg = new RegExp("^chrome.*/.*/userlist.html$", "i");
        for (let i = 0, len = tabs.length; i < len; i++) {
            if (reg.test(tabs[i].url)) {
                isOpened = true;
                tabId = tabs[i].id;
                break;
            }
        }
        if (!isOpened) {
            chrome.tabs.create({
                url: 'userlist.html',
                active: true
            });
        } else {
            chrome.tabs.update(tabId, {highlighted: true}, function () {
                chrome.runtime.sendMessage({
                    type: 'reload'
                });
            });
        }
    });
});


const MM_KEY = 'MM_SPIDER_USERS';
const OPT_KEY = 'MM_OPTIONS';
chrome.runtime.onMessage.addListener(function (request, sender, callback) {
    if (request.type === 'addUser') {
        let user = request.content;
        let allUsers = JSON.parse(localStorage.getItem(MM_KEY) || '{}');
        allUsers[user.name] = user;
        localStorage.setItem(MM_KEY, JSON.stringify(allUsers));
    } else if (request.type === 'getUser') {
        let allUsers = JSON.parse(localStorage.getItem(MM_KEY) || '{}');
        callback && callback(allUsers);
    } else if (request.type === 'cleanUser') {
        localStorage.setItem(MM_KEY, '{}');
    } else if (request.type === 'getOptions') {
        let opts = JSON.parse(localStorage.getItem(OPT_KEY) || '{}');
        callback && callback(opts);
    } else if (request.type === 'setOptions') {
        localStorage.setItem(OPT_KEY, request.content);
    }
});