const {Client} = require('discord.js');
const client = new Client();
const token = require("./token.json");
const chNames = require("./channelList.json");
const curDate = require('moment');
require('moment-timezone');
curDate.tz.setDefault('Asia/Seoul');
let curTime = curDate().format('YYYY-MM-DD HH:mm:ss');

function nowTime()
{
    return curTime = curDate().format('YYYY-MM-DD HH:mm:ss');
}

function sevrLog(logMsg)
{
    console.log(`[${nowTime()}] ` + logMsg);
}

let botId;
let channel01;
let userList = [];
let triggerNoticeStr = `명령어 : 대기인원, 등록, 해제, 겜할겜`;

function findUserIdx(userId)
{
    return userList.findIndex(value => value == userId);
}

client.on('ready',() => {
    sevrLog(`bot ready`);
    botId = client.user.id;
    channel01 = client.channels.cache.find(ch => ch.name == chNames.channel01);
    if(!channel01)return;
});

function clearBotMsg()
{
    const targetChannel = channel01;
    if(!targetChannel) return;
    let botmsg = targetChannel.messages.fetch({limit : 30}).then(botmsg => {
        const botMessages = [];
        botmsg.filter(m => m.author.id === botId).forEach(msg => botMessages.push(msg));
        targetChannel.bulkDelete(botMessages).then(() => {
           //console.log('remove');
        });
    });
}

client.on('presenceUpdate', (oldmem, newmem) => {
    const oldname = oldmem.user.username;
    const newname = newmem.user.username;
    const oldstat = oldmem.status;
    const newstat = newmem.status;

    sevrLog(`${newname} is ${newstat}`);

    const targetChannel = channel01;
    if(!targetChannel) return;

    if(newstat == 'online')
    {
        clearBotMsg();
        targetChannel.send(
`${newname}님이 로그인. 현재 대기인원은 ${userList.length}명. 
${triggerNoticeStr}
## 이 대기열은 언제든지 겜할겜 에 의한 호출에 응할 수 있음을 나타냄. ##`
        );
    }
});

client.on('message', msg => {
    const curUserName = msg.author.username;
    const curUserId = msg.author.id;

    if(msg.content === '대기인원'){
        clearBotMsg();
        msg.channel.send(
`현재 대기인원은 ${userList.length}명. 
${triggerNoticeStr}
## 이 대기열은 언제든지 겜할겜 에 의한 호출에 응할 수 있음을 나타냄. ##`
        )
        msg.delete();
    }
    else if(msg.content === '등록'){
        clearBotMsg();
        if(findUserIdx(curUserId) === -1)
        {
            userList.push(curUserId);
            msg.channel.send(
`${curUserName}님 등록 완료. 현재 대기인원은 ${userList.length}명.
${triggerNoticeStr}
## 이 대기열은 언제든지 겜할겜 에 의한 호출에 응할 수 있음을 나타냄. ##`
            );
            sevrLog(`${curUserName} : ${curUserId} is registed now`);
        }
        else
        {
            msg.channel.send(
`${curUserName}님은 이미 등록됨. 현재 대기인원은 ${userList.length}명.
${triggerNoticeStr}
## 이 대기열은 언제든지 겜할겜 에 의한 호출에 응할 수 있음을 나타냄. ##`
            );
            sevrLog(`${curUserName} : ${curUserId} is already registed`);
        }
        msg.delete();
    }
    else if(msg.content === '해제'){
        clearBotMsg();
        let userIdx = findUserIdx(curUserId);
        if(userIdx !== -1)
        {
            userList.splice(userIdx, 1);
            msg.channel.send(
`${curUserName}님 해제 완료. 현재 대기인원은 ${userList.length}명.
${triggerNoticeStr}
## 이 대기열은 언제든지 겜할겜 에 의한 호출에 응할 수 있음을 나타냄. ##`
            );
            sevrLog(`${curUserName} : ${curUserId} is unregisted now`);
        }
        else
        {
            msg.channel.send(
`${curUserName}님은 미등록. 현재 대기인원은 ${userList.length}명.
${triggerNoticeStr}
## 이 대기열은 언제든지 겜할겜 에 의한 호출에 응할 수 있음을 나타냄. ##`
            );
            sevrLog(`${curUserName} : ${curUserId} is not registed`);
        }
        msg.delete();
    }
    else if(msg.content === '겜할겜'){
        let userCallStr = ``;
        for(const idx in userList)
        {
            userCallStr = userCallStr + `<@${userList[idx]}> `;
        }
        msg.channel.send(
`${userCallStr} ㄱㄱ`
        );
        msg.channel.send(`더 이상 호출되는 것을 원하지 않는다면 해제를 입력하십시오.`);
        msg.delete();
    }
});

client.login(token.token);