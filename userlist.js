/**
 * 脉脉详情页信息抓取工具
 *
 * @author 阿烈叔
 * @date 2018-06-06
 */

let School211List = "北京大学,清华大学,浙江大学,复旦大学,上海交通大学,南京大学,武汉大学,四川大学,中山大学,山东大学,华中科技大学,哈尔滨工业大学,吉林大学,南开大学,中国科学技术大学,西安交通大学,中南大学,东南大学,中国人民大学,大连理工大学,天津大学,厦门大学,北京师范大学,华南理工大学,同济大学,北京航空航天大学,兰州大学,重庆大学,中国农业大学,西北工业大学,北京理工大学,华东师范大学,湖南大学,华东理工大学,苏州大学,南京航空航天大学,郑州大学,华中师范大学,南京农业大学,电子科技大学,东北大学,西南大学,武汉理工大学,上海大学,南京理工大学,东北师范大学,江南大学,西安电子科技大学,华中农业大学,西南交通大学,暨南大学,华北电力大学（北京）,北京科技大学,北京化工大学,东华大学,南京师范大学,北京交通大学,西北农林科技大学,华南师范大学,中国海洋大学,西北大学,陕西师范大学,哈尔滨工程大学,河海大学,南昌大学,北京工业大学,湖南师范大学,福州大学,北京邮电大学,合肥工业大学,云南大学,上海财经大学,中国药科大学,中南财经政法大学,长安大学,广西大学,西南财经大学,安徽大学,太原理工大学,贵州大学,北京林业大学,东北林业大学,中国政法大学,新疆大学,中国传媒大学,四川农业大学,中央财经大学,天津医科大学,辽宁大学,对外经济贸易大学,东北农业大学,河北工业大学,北京中医药大学,上海外国语大学,大连海事大学,中央民族大学,北京外国语大学,内蒙古大学,石河子大学,海南大学,延边大学,宁夏大学,中央音乐学院,北京体育大学,青海大学,北京协和医学院,中国矿业大学（北京）,中国矿业大学（徐州）,西藏大学,解放军国防科学技术大学,解放军第二军医大学,解放军第四军医大学".split(',');
let School985List = "北京大学,清华大学,复旦大学,上海交通大学,武汉大学,浙江大学,中国人民大学,南京大学,吉林大学,中山大学,北京师范大学,华中科技大学,四川大学,中国科学技术大学,南开大学,山东大学,中南大学,西安交通大学,厦门大学,哈尔滨工业大学,北京航空航天大学,同济大学,天津大学,华东师范大学,东南大学,中国农业大学,华南理工大学,湖南大学,西北工业大学,大连理工大学,北京理工大学,重庆大学,东北大学,兰州大学,中国海洋大学,,西北农林科技大学".split(',');

/**
 * 把抓取到的用户信息全部列举出来
 * @param type
 */
let buildUsers = function (type) {
    chrome.runtime.sendMessage({
        type: 'getUser'
    }, function (data) {

        let users = Object.values(data);
        if (type === '211') {
            users = users.filter(u => {
                return (u.school || []).some(s => School211List.includes(s.school));
            });
        } else if (type === '985') {
            users = users.filter(u => {
                return (u.school || []).some(s => School985List.includes(s.school));
            });
        }

        $('#mmCounter').text(users.length);
        let html = ['<table id="mmTable" class="table table-bordered table-hover table-striped">' +
        '<thead><tr>' +
        '<th rowspan="2">序号</th>' +
        '<th rowspan="2">姓名</th>' +
        '<th rowspan="2" class="hide">电话</th>' +
        '<th rowspan="2" class="hide">邮箱</th>' +
        '<th rowspan="2">所在城市</th>' +
        '<th rowspan="2">当前职位</th>' +
        '<th colspan="4">教育经历</th>' +
        '<th colspan="4">工作经历</th>' +
        '</tr>' +
        '<tr>' +
        '<th>学校</th>' +
        '<th>年限</th>' +
        '<th>专业</th>' +
        '<th>学历</th>' +
        '<th>公司</th>' +
        '<th>年限</th>' +
        '<th>职位</th>' +
        '<th class="hide">工作内容</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>'];

        users.forEach((item, index) => {

            let maxRow = Math.max(item.school.length, item.company.length);

            html.push('<tr>' +
                '<td rowspan="' + maxRow + '">' + (index + 1) + '</td>' +
                '<td rowspan="' + maxRow + '">' + item.name + '</td>' +
                '<td rowspan="' + maxRow + '" class="hide">' + (item.telephone || '#') + '</td>' +
                '<td rowspan="' + maxRow + '" class="hide">' + (item.email || '#') + '</td>' +
                '<td rowspan="' + maxRow + '">' + item.city + '</td>' +
                '<td rowspan="' + maxRow + '">' + item.title + '</td>' +

                // 学校列表
                ((isch) => {
                    let school = isch[0] || {school: '', major: '，，'};
                    let schDetail = school.major.split('，');
                    return '<td>' + school.school + '</td>' +
                        '<td>' + schDetail[0] + '</td>' +
                        '<td>' + schDetail[1] + '</td>' +
                        '<td>' + schDetail[2] + '</td>';
                })(item.school) +

                // 公司列表
                ((icom) => {
                    let company = icom[0] || {company: '', title: '，，'};
                    let comDetail = company.title.split('，');
                    return '<td>' + company.company + '</td>' +
                        '<td>' + comDetail[0] + '</td>' +
                        '<td>' + comDetail[1] + '</td>' +
                        '<td class="hide">' + company.duty + '</td>';
                })(item.company) +

                '</tr>');

            for (let i = 1; i < maxRow; i++) {
                let cHtml = '<tr>';

                let school = item.school[i] || {school: '', major: '，，'};
                let schDetail = school.major.split('，');
                cHtml += '<td>' + school.school + '</td>' +
                    '<td>' + schDetail[0] + '</td>' +
                    '<td>' + schDetail[1] + '</td>' +
                    '<td>' + schDetail[2] + '</td>';

                let company = item.company[i] || {company: '', title: '，，'};
                let comDetail = company.title.split('，');
                cHtml += '<td>' + company.company + '</td>' +
                    '<td>' + comDetail[0] + '</td>' +
                    '<td>' + comDetail[1] + '</td>' +
                    '<td class="hide">' + company.duty + '</td>';

                cHtml += '</tr>';
                html.push(cHtml);
            }
        });
        html.push('</tbody></table>');
        $('#mmBox').html(html.join(''))
    });
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if(request.type === 'reload') {
        location.reload();
    }
});

$(function () {
    buildUsers();

    $('#btnClean').click(function (e) {
        if (window.confirm('数据清除后可重新进行抓取，但已清除的数据不可恢复，最好将全部数据导出Excel！请再次确认是否删除？')) {
            chrome.runtime.sendMessage({
                type: 'cleanUser'
            }, function () {
                buildUsers();
            });
        }
    });

    $('#btnDownload').click(function (e) {
        (new Table2Excel({
            defaultFileName: "Mapping-" + (new Date().toLocaleString().replace(/[^\w]/g, '')) + ".xlsx"
        })).export($('#mmTable')[0]);
    });

    $('#schoolType').change(function (e) {
        buildUsers(this.value)
    });
});