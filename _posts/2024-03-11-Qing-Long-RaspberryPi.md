---
layout: post
title: 树莓派部署羊毛党神器——青龙面板
date: 2024-03-11 21:30:00
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

这里比较麻烦的地方是通知的设置。我打算使用telegram的bot直接推送，但是众所周知由于墙的原因，并不能直接使用，在系统设置-通知设置里面通过代理是可以发送的，但是定时任务中的脚本都无法发送，甚至尝试了[给容器配置代理](https://anthonysun256.github.io/docker-proxy-complete-solution/)。后续打算看看使用自建的tg反向代理转发来试试。最后放上今天的京豆收入。

![tongji](../../../../assets/images/ql_tongji.jpg)

