---
layout: post
title: cloudflare实用姿势
date: 2024-04-16 15:37:09
disqus: true
categories: Computer&nbsp;Network
---




>~~天下没有免费的午餐~~



搭建青龙面板之后，为了能够更方便的发送telegram通知，我打算利用[cloudflare](https://www.cloudflare.com)来搭建一个转发代理。为了更好地使用cf的服务，我们需要一个自己的域名。这时候顺手一搜就能发现，有个eu.org的可以免费注册，赶紧上车。



### 注册eu.org免费域名

先用ChatGPT来介绍一下怎么注册吧！

> .eu.org 
是一个免费的第三级域名服务，提供给欧洲地区的个人、组织和企业使用。它提供了简单的域名申请流程，以下是申请流程的基本步骤：
>
> 1. **访问网站：** 首先，访问 .eu.org 的官方网站（https://nic.eu.org/）。
>
> 2. **选择域名：** 
在网站上搜索并选择您希望注册的域名。请确保您选择的域名符合 .eu.org 
的注册规定，并且尚未被他人注册。
>
> 3. **填写申请表格：** 
一旦选择了域名，您需要填写一个简单的申请表格。通常，您需要提供一些基本信息，如您的姓名、电子邮件地址和所在国家等。
>
> 4. **提交申请：** 填写完申请表格后，点击提交按钮将申请提交给 .eu.org 
的注册机构。
>
> 5. **等待审核：** 
一旦提交申请，注册机构将对您的申请进行审核。审核通常需要一到几个工作日的时间。
>
> 6. **获取确认邮件：** 
如果您的申请通过审核，您将收到一封确认邮件，其中包含有关您的域名注册信息和后续操作的说明。
>
> 7. **设置DNS：** 
在确认邮件中，通常会包含有关如何设置您的域名解析DNS的信息。您需要将您的域名解析指向您的服务器或托管提供商。
>
> 8. **等待生效：** 
完成DNS设置后，您的域名将开始生效。这可能需要一段时间，取决于DNS记录的传播速度。
>
> 9. **管理域名：** 
一旦您的域名注册成功，您可以通过注册机构提供的管理界面管理您的域名，包括更新联系信息、修改DNS设置等操作。
>
> 
请注意，具体的申请流程和要求可能会根据注册机构的政策和程序而有所不同。因此，在申请之前，建议您仔细阅读并遵循相关的注册指南和要求。

就是这么简单的说。但是有一些细节，并没有说明。进入官网后，点击“**Sign-in 
or sign-up [here](https://nic.eu.org/arf/)!** 
“先进行注册。打开页面后选择”Register“，根据联系人信息依次填入自己的信息，然后设置密码即可。之后会提示账号成功创建，让你去邮箱验证，这里记得保存一下用户名”XXXXX-FREE“！接下来去邮箱收邮件，验证一下就可以拿用户名和密码去登录了。

然后是申请域名部分，在”Complete domain 
name“部分填上想要申请的域名，然后在Name 
Servers部分填上域名服务器，选择server names，如下图：

![eu_org_nameservers](../../../../assets/images/eu_org_nameservers.jpg)

点击提交即可，剩下的就是慢慢等邮件了，其它细节请参考[这里](https://wp.gxnas.com/12752.html)。最近看到因为墙的问题，有些eu.org解析出问题了，可以自己部署一下[SmartDNS](https://pymumu.github.io/smartdns/)来解决，这里先小小记录一下。



### 配置CloudFlare Workers

因为国内workers.dev 
无法访问，必须使用域名路由，所以需要上面的免费域名，由于我申请之后一直没有收到邮件，只有先直接配置试试了。首先去[CloudFlare官网](https://www.cloudflare.com)登录注册一波，然后点击左侧边栏里的"Workers&Pages"，就可以看到下面的页面：

![cloudflare](../../../../assets/images/cloudflare_dash.jpg)

可以看到免费的Workers每天支持十万次请求，对于个人用户通知发送来说绰绰有余。废话不多说，直接创建一个玩玩，点击蓝色的"Create 
application"按钮。之后点击”Create 
Worker“，这时候有示例代码，先不用管，需要点击Deploy之后才能修改。这里需要记录一下部署的地址，类似于”https://worker-name-xxx.xxxxxxxxxxxx.workers.dev“。点击Deploy部署之后再将worker.js修改成下面的[样子](https://github.com/pppscn/SmsForwarder/wiki/%E9%99%84%E5%BD%956%EF%BC%9A%E5%8F%8D%E5%90%91%E4%BB%A3%E7%90%86TG_BOT_API)：

```js
const whitelist = ["/bot你的botID:"];
//示例const whitelist = ["/bot123456:"];
const tg_host = "api.telegram.org";

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

function validate(path) {
    for (var i = 0; i < whitelist.length; i++) {
        if (path.startsWith(whitelist[i]))
            return true;
    }
    return false;
}

async function handleRequest(request) {
    var u = new URL(request.url);
    u.host = tg_host;
    if (!validate(u.pathname))
        return new Response('Unauthorized', {
            status: 403
        });
    var req = new Request(u, {
        method: request.method,
        headers: request.headers,
        body: request.body
    });
    const result = await fetch(req);
    return result;
}
```

然后就可以打开一个cmd测试一下了。输入下面的命令，看看能否在telegram上收到消息：

```bash
curl -F "chat_id=xxxxxx" -F "text=主人您好，从cloudflare 
worker给您发来消息测试" 
https://worker-name-xxx.xxxxxxxxxxxx.workers.dev/botxxxxxxxxxxx/sendMessage
```

这里部署地址、bot的id要跟上面worker.js里的一致才行。其它问题可以参考这篇[博客](https://anerg.com/2022/07/25/reverse-proxy-telegram-bot-api-using-cloudflare-worker.html)。



### 其它CloudFlare实用姿势

既然CloudFlare能免费部署js的脚本，能不能通过js脚本fetch一下社交平台各个up主动态呢？Bingo！已经有人实现辣！[RssWorker](https://github.com/yllhwa/RSSWorker)就是通过js脚本fetch对应网页并生成feed.xml然后推送到RSS客户端，虽然目前只支持b站、微博、小红书、tg公开频道，对于个人使用来说已经足够了，其它可以通过[RSSHub](https://docs.rsshub.app/zh/)来进行添加。直接去仓库点击Deploy就可以部署到自己的CloudFlare上了，还有很多实用的仓库，可以参考[这里](https://github.com/zhuima/awesome-cloudflare)，cloudflare作为赛博菩萨真的是互联网之光。
