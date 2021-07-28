const fs = require('fs');
const axios = require('axios');
// const { getCookie } = require('./util');
// 公共变量
const serverJ = process.env.PUSH_KEY;
const Cookie = process.env.WEREAD_COOKIE;
const wsID = process.env.WS_ID;
// const wxID = getCookie(Cookie, 'wr_vid');

async function getContent(remainday, wereadText) {
    const time = new Intl.DateTimeFormat('zh', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(new Date());

    return `${time} \n剩余天数：${remainday}天；\n${wereadText}\n\n`;
}
//剩余天数
async function getRemainday() {
    const res = await axios({
        method: 'get',
        url: 'https://weread.qq.com/web/pay/memberCardSummary?pf=ios',
        headers: {
            Cookie,
        },
    });
    // console.warn('res', res.data);
    //剩余天数
    const remainday = Math.max(0, parseInt((res.data.expiredTime - Date.parse(new Date()) / 1000) / (24 * 60 * 60)));
    // console.warn('remainday', remainday);
    return remainday;
}

//瓦斯组队
const rq = [
    {
        label: '周二翻一翻',
        action: 'flip',
    },
    {
        label: '周四联名卡',
        action: 'giveonegetone',
    },
    {
        label: '周六无限卡',
        action: 'link',
    },
];
async function getWeread(action) {
    const res = await axios({
        method: 'get',
        url: `https://weread.qnmlgb.tech/onestep_submit/${wsID}?action=${action}`,
        headers: {
            Cookie,
        },
    });
    return res.data;
}
//推送
function sendNotify(title, desp) {
    return axios({
        method: 'POST',
        url: `https://sc.ftqq.com/${serverJ}.send?title=${title}&desp=${desp}`,
    });
}

async function start() {
    //剩余天数
    const remainday = await getRemainday();
    //组队
    const result = [];
    for (let { action } of rq) {
        const res = await getWeread(action);
        result.push(res);
    }
    //结果内容
    const content = getContent(remainday, result.join('\n'));
    await fs.appendFileSync('./config.txt', content, 'utf8');

    if (serverJ) {
        await sendNotify('微信读书', content);
        console.log('发送结果完毕');
    }
}

start();
