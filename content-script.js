/**
 * 脉脉详情页信息抓取工具
 *
 * @author 阿烈叔
 * @date 2018-06-06
 */


/**
 * 自动消失的Alert弹窗
 * @param content
 */
window.alert = function (content) {
    window.clearTimeout(window.feHelperAlertMsgTid);
    let elAlertMsg = document.querySelector("#fehelper_alertmsg");
    if (!elAlertMsg) {
        let elWrapper = document.createElement('div');
        elWrapper.innerHTML = '<div id="fehelper_alertmsg" style="position:fixed;top:5px;left:42%;z-index:1000000">' +
            '<p style="background:#000;display:inline-block;color:#fff;text-align:center;' +
            'padding:10px 10px;margin:0 auto;font-size:14px;border-radius:4px;">' + content + '</p></div>';
        elAlertMsg = elWrapper.childNodes[0];
        document.body.appendChild(elAlertMsg);
    } else {
        elAlertMsg.querySelector('p').innerHTML = content;
        elAlertMsg.style.display = 'block';
    }

    window.feHelperAlertMsgTid = window.setTimeout(function () {
        elAlertMsg.style.display = 'none';
    }, 3000);
};

/**
 * DOM分析，获取用户信息
 * @returns {{}}
 */
let getUserByDOM = function () {

    let user = {};
    let elContact = $('dl.contact_detail_info');
    user.name = elContact.find('dd.contact_detail_name').text();
    user.title = elContact.find('dd').eq(1).text();

    let elConnect = $('dl.contact_detail_connect_info');
    let length = elConnect.children('dd').length;
    user.telephone = elConnect.children('dd').eq(0).text();
    if (!/\d+/g.test(user.telephone)) {
        user.telephone = '';
    }
    if (length > 2) {
        user.email = elConnect.children('dd').eq(1).text();
        user.city = elConnect.find('dd').eq(2).text();
    } else {
        user.city = elConnect.find('dd').eq(1).text();
        user.email = '';
    }

    let elPanels = $('div.panel-default');
    user.company = elPanels.eq(0).find('ul>li').map((i, li) => {
        return {
            company: $(li).find('div.title').text(),
            title: $(li).find('span.text-muted.small').eq(0).text(),
            duty: $(li).find('div.text-content.short-text').text()
        }
    }).toArray();

    user.school = elPanels.eq(1).find('ul>li').map((i, li) => {
        return {
            school: $(li).find('div.title').text(),
            major: $(li).find('span.text-muted.small').eq(0).text(),
            duty: $(li).find('div.text-content.short-text').text()
        }
    }).toArray();

    return user;
};

/**
 * 分析网页源代码，直接提取用户信息
 */
let getUserByRowSource = function () {
    let js = $('script:not([src])').eq(0).text();
    js = js.replace('window.onLoadFinished && window.onLoadFinished()', '');
    let shareData = new Function(js + ';return share_data;')();
    let data = shareData.data.uinfo;
    return {
        name: data.realname,
        city: data.province + ' ' + data.city,
        gender: ['未知', '男', '女'][data.gender],
        email: data.email,
        telephone: data.mobile,
        title: data.company + data.position,

        school: data.education.map(e => {
            let time = (e.start_date + '~' + e.end_date).replace(/-/g, '.');
            let degree = ['专科', '本科', '硕士', '博士'][e.degree];
            return {
                school: e.school,
                major: [time, e.department, degree].join('，'),
                duty: e.description
            }
        }),
        company: data.work_exp.map(w => {
            let time = ((w.start_date || '未知') + '~' + (w.end_date || '至今')).replace(/-/g, '.');
            return {
                company: w.company,
                title: time + '，' + w.position,
                duty: w.description
            }
        })
    };
};

/**
 * 保存用户信息
 * @param user
 */
let saveUser = function (user) {
    chrome.runtime.sendMessage({
        type: 'addUser',
        content: user
    }, function () {
        alert('恭喜，' + user.name + ' 的信息已抓取成功！');

        chrome.runtime.sendMessage({
            type: 'getOptions'
        }, function (opt) {
            if (opt === 1) {
                window.close();
            }
        });

    });
};

/**
 * 爬虫，走起
 */
let spider = function () {
    try {
        saveUser(getUserByRowSource());
    } catch (e) {
        window.setTimeout(function loop() {
            let el = $('div.PCcontainer');
            if (el[0]) {
                saveUser(getUserByDOM());

            } else {
                window.setTimeout(loop, 100);
            }
        }, 16);
    }
};

spider();

