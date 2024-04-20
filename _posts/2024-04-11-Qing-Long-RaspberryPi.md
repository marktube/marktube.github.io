---
layout: post
title: 树莓派部署薅羊毛神器——青龙面板
date: 2024-04-11 09:16:00
disqus: true
categories: Raspberry&nbsp;Pi
---

> 春风赋锦花~

<center><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=27971441&auto=1&height=66"></iframe></center>

最近想起之前的自动签到脚本因为cookies失效的问题一直没管，导致没有薅到羊毛，于是打算紧急修复一下。然后按照以前的操作实施时发现脚本已经失效了，问了一下万能的搜索引擎，发现大家都是用一些低调的仓库更新脚本，而且把脚本挂在[“青龙”定时任务管理平台](https://github.com/whyour/qinglong)上，于是我也打算上手玩玩。

先把[nodejs](https://github.com/nodesource/distributions#debian-versions)升级一下，直接暴力清除再装新版，命令如下：

```bash
# remove nodejs and configurations
apt-get purge nodejs &&\
rm -r /etc/apt/sources.list.d/nodesource.list &&\
rm -r /etc/apt/keyrings/nodesource.gpg
# install nodejs 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```

然后运行一下试试，不出意外地出意外了。。。直接提示：“node: /usr/lib/arm-linux-gnueabihf/libstdc++.so.6: version `GLIBCXX_3.4.26' not found (required by node) ”

用命令先找一下这个库

```bash
sudo find / -name libstdc++.so.6
```

然后看看有没有这个版本

```bash
strings /usr/lib/x86_64-linux-gnu/libstdc++.so.6 | grep GLIBCXX
```

果然没有，好吧，我的gcc编译器版本太低，才到8.3.0，所以不支持用gcc10构建的nodejs版本，那么就只有升级一下gcc了。这时候才注意到我的树莓派系统已经落后两个大版本了，目前是基于Debian10 Buster，最新已经到Debian 12 Bookworm。

### 升级树莓派系统

打算升级到最新的系统，中间跳了两个版本，所以打算一步一步来，先升到Debian 11 Bullseye。参考[这篇文章](https://www.linuxuprising.com/2021/11/how-to-upgrade-raspberry-pi-os-10.html#:~:text=How%20to%20upgrade%20Raspberry%20Pi%20OS%2010%20Buster,OS%20from%20Buster%20to%20Bullseye.%20...%20More%20items)，直接改源配置文件，把buster替换成bullseye。运行下面的命令即可：

```bash
sudo sed -i 's/buster/bullseye/g' /etc/apt/sources.list
sudo sed -i 's/buster/bullseye/g' /etc/apt/sources.list.d/raspi.list
sudo apt update
sudo apt install libgcc-8-dev gcc-8-base
sudo apt full-upgrade
```

如果不装gcc8会遇到一个问题提示：“Some packages could not be installed. [...] The following packages have unmet dependencies: libc6-dev : Breaks: libgcc-8-dev (< 8.4.0.2~) but 8.3.0-6+rpi1 is to be installed”。升级完成后清理一下，解放一些空间

```bash
sudo apt autoremove
sudo apt autoclean
```

中间出现一些小问题，升级之后发现wifi被禁用，提示要在raspi-config里选择wlan country，参考[这个](https://blog.csdn.net/qq_37887537/article/details/118357015)可以重新启用wifi。

然后是ifconfig发现eth0变成了enxb827ebff4bb6，导致dhcpcd和dnsmasq服务配置不能正常运行，还好我提前保存了wlan0的ip地址，通过无线网ssh到树莓派。解决方法也很简单，参考[这个帖子](https://raspberrypi.stackexchange.com/questions/72346/there-is-no-eth0-when-i-input-ifconfig)，在/boot/cmdline.txt里加上net.ifnames=0就可以了。

看了一下官方给出的Bookworm的新特性，dhcpcd被NetworkManager取代了，害怕又折腾出什么问题，就先还是用着Bullseye了。

### 安装青龙

首先还是安装nodejs的问题，因为升级了libstdc++，能够找到相对应的链接库，于是就可以直接安装nodejs了，运行以下命令：

```bash
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs
```

等待安装完成就可以了。接下来就是用npm安装库了，没有换国内的源的话需要挂载代理

```bash
npm install -g node-pre-gyp pnpm@8.3.1
npm install -g @whyour/qinglong
```

这里用的是-g选项全局安装，会提示需要权限，所以还要记得重新设置一下npm的全局目录。然后直接运行qinglong，根据提示设置环境变量。接下来就是不出意外地又出意外了，好家伙，我直接大呼好家伙！

![haojiahuo](../../../../assets/images/ql_haojiahuo.jpg)

看这个脚本是读取了/etc/os-release文件里的ID，然后跟一些系统名称比较，因为没有树莓派，所以提示不支持该系统部署。我尝试把ID改成debian，但是会提示需要权限来apt安装一些软件，遂作罢。接下来去GitHub上的issue里面翻了一下，看来大家都是用docker部署的，不影响原生树莓派系统，我只好再重新安装docker。根据[官方教程](https://docs.docker.com/engine/install/raspberry-pi-os/)安装docker，添加用户组实现无root权限使用docker（参考[这里](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user)）。接下来运行

```bash
docker run -dit -v $PWD/ql/data:/ql/data -p 5700:5700  -e QlBaseUrl="/" -e QlPort="5700" --name qinglong   --hostname qinglongpi --restart unless-stopped whyour/qinglong:latest
```

然后就可以在浏览器里访问青龙面板了。

![qinglong](../../../../assets/images/ql_qinglong.jpg)

按照提示一步一步安装即可。设置密码然后登录，在System Settings-Other Settings中可以设置语言为中文。后面拉库和部署的步骤参考[这篇博客](https://blog.csdn.net/Blue_W_Blue/article/details/124271487)和[某东签到仓库](https://github.com/6dylan6/jdpro/tree/main)。

### 通知脚本修复

这里比较麻烦的地方是通知的设置。我打算使用telegram的bot直接推送，但是众所周知由于墙的原因，并不能直接使用，在系统设置-通知设置里面通过代理是可以发送的，但是定时任务中的脚本都无法发送，甚至尝试了[给容器配置代理](https://anthonysun256.github.io/docker-proxy-complete-solution/)。原来的脚本还是一直发送tg消息失败，就算我在脚本中设置了代理地址也一直连接不上，提示：

```js
RequestError
    at ClientRequest.<anonymous> (/ql/node_modules/.pnpm/got@11.8.6/node_modules/got/dist/source/core/index.js:970:111)
    at Object.onceWrapper (node:events:633:26)
    at ClientRequest.emit (node:events:530:35)
    at origin.emit (/ql/node_modules/.pnpm/@szmarczak+http-timer@4.0.6/node_modules/@szmarczak/http-timer/dist/source/index.js:43:20)
    at TLSSocket.socketErrorListener (node:_http_client:495:9)
    at TLSSocket.emit (node:events:518:28)
    at emitErrorNT (node:internal/streams/destroy:169:8)
    at emitErrorCloseNT (node:internal/streams/destroy:128:3)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)AggregateError
    at internalConnectMultiple (node:net:1114:18)
    at internalConnectMultiple (node:net:1177:5)
    at Timeout.internalConnectMultipleTimeout (node:net:1687:3)
    at listOnTimeout (node:internal/timers:575:11)
    at process.processTimers (node:internal/timers:514:7) {
  code: 'ETIMEDOUT',
```

不得不去看脚本然后排错了，在sendnotify.js里看到主要是这个函数里的问题：

```js
function tgBotNotify(text, desp) {
  return new Promise((resolve) => {
    if (TG_BOT_TOKEN && TG_USER_ID) {
      const options = {
        url: `${TG_API_HOST}/bot${TG_BOT_TOKEN}/sendMessage`,
        json: {
          chat_id: `${TG_USER_ID}`,
          text: `${text}\n\n${desp}`,
          disable_web_page_preview: true,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        timeout,
      };
      if (TG_PROXY_HOST && TG_PROXY_PORT) {
        const { HttpProxyAgent, HttpsProxyAgent } = require('hpagent');
        const options = {
          keepAlive: true,
          keepAliveMsecs: 1000,
          maxSockets: 256,
          maxFreeSockets: 256,
          proxy: `http://${TG_PROXY_AUTH}${TG_PROXY_HOST}:${TG_PROXY_PORT}`,
        };
        const httpAgent = new HttpProxyAgent(options);
        const httpsAgent = new HttpsProxyAgent(options);
        const agent = {
          http: httpAgent,
          https: httpsAgent,
        };
        Object.assign(options, { agent });
      }
      console.log(options)
      $.post(options, (err, resp, data) => {
```

我在post请求前打印了options，看到agent并没有加到options的属性中。修复方法也很简单，把if条件里的options换一个变量名即可：

```js
if (TG_PROXY_HOST && TG_PROXY_PORT) {
        const { HttpProxyAgent, HttpsProxyAgent } = require('hpagent');
        const configs = {
          keepAlive: true,
          keepAliveMsecs: 1000,
          maxSockets: 256,
          maxFreeSockets: 256,
          proxy: `http://${TG_PROXY_AUTH}${TG_PROXY_HOST}:${TG_PROXY_PORT}`,
        };
        const httpAgent = new HttpProxyAgent(configs);
        const httpsAgent = new HttpsProxyAgent(configs);
        const agent = {
          http: httpAgent,
          https: httpsAgent,
        };
        Object.assign(options, { agent });
      }
```

通知脚本中的变量"TG_PROXY_HOST"和"TG_PROXY_PORT"等会优先使用Configuration File里的环境变量。但是，订阅管理中拉取的通知是使用“系统设置-通知设置”里的环境变量。修改好之后的sendnotify.js不要忘了复制一份放在deps目录下，防止重新拉库后被覆盖。

接下来就是设置qinglong容器的代理问题了，如果本地有代理服务器，可以直接填上。但因为本人是在树莓派上开的docker容器，设置代理就有一点小麻烦了。大多数机场用户都是用clash，去年十月份由于某些不可描述的原因删库跑路了，好在还有一些软件备份可以继续使用。clash在开启代理时，本地开放[http://127.0.0.1:7890]()作为http代理端口，除了本机外，其他局域网内ip无法访问。虽然，可以在配置中设置"allow-lan: true"来共享http代理，然而因为代理链路没有认证过程，局域网内其它主机可以偷网，容易造成机场流量偷跑。经过我的一些探索，可以把clash放进docker容器里运行，然后把http代理地址设置成[http://127.0.0.1:7890]()。大致步骤如下：

1. 去下载[clash-armv7](https://downloads.clash.wiki/ClashPremium/)
2. 在scripts文件夹里创建clash文件夹并放入clash-linux-armv7（记得加入运行权限chmod +x）
3. 将机场配置文件config.yaml、cache.db、Country.mmdb和webui文件（dashboard文件夹）放入clash文件夹
4. 在config.yaml文件夹中设置external-controller地址和secret，以及加入一行"external-ui: dashboard"，在docker container中增加一个映射端口来控制clash，例如9090
5. 新建一个脚本run_clash.sh加入以下内容:``` nohup ./clash-linux-armv7 -f config.yaml -d . > output.log 2>&1 &```
6. 
运行run_clash.sh脚本开启代理即可，通过[http://树莓派ip:9090/ui]()来选取线路

最后放上今天的京豆收入，欢迎分享互助码！

![tongji](../../../../assets/images/ql_tongji.jpg)

