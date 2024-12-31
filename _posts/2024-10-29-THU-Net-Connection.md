---
layout: post
title: 大清校园网连接配置
date: 2024-10-29 15:12:15
disqus: true
categories: Network
---


> ~~深澜是什么，客户端？不存在的~~



为了更好地访问校园服务，网络总是必不可少。但是官方校园网认证对于各个操作系统的支持并不完善。有需求就有解决方案，同学们八仙过海各显神通开发出很多工具，参见[thu.services/utils](https://thu.services/utils/):

> | 项目链接                                                     | 支持平台                                                     | 实现语言   | 目前是否可用（是否被维护）     | 特性                                                         |
> | ------------------------------------------------------------ | ------------------------------------------------------------ | ---------- | ------------------------------ | ------------------------------------------------------------ |
> | [Tunet-2018 (official)](https://its.tsinghua.edu.cn/xywl/xywsyzn/yxw_hkhd_/khdxz.htm) | Windows-GUI, Linux-CLI                                       | 未知       | 可用                           | 未调查                                                       |
> | [GoAuthing](https://github.com/z4yx/GoAuthing/)              | Linux-CLI (x86\_64, arm, mips, ppc, riscv), Windows-CLI, Mac OS-CLI (Intel, Apple) | Go         | 可用                           | 全平台全架构，准入与准出，v4和v6，systemd 服务，TUNA 提供[镜像](https://mirrors.tuna.tsinghua.edu.cn/github-release/z4yx/GoAuthing/LatestRelease/)可以在未认证时下载认证工具，提供认证相关库 |
> | [tunet-python](https://github.com/yuantailing/tunet-python)  | 支持 python 的平台，CLI                                      | Python     | 可用                           | v4与v6，准入与准出，流量与准入出状态监控                     |
> | [tunet-c](https://github.com/robertying/tunet-c)             | OpenWRT, Linux, macOS; CLI                                   | C          | 可用                           | 提供认证相关库，二进制文件较小                               |
> | [tunet-rust](https://github.com/Berrysoft/tunet-rust)        | Windows, Mac OS, Linux, Android, iOS                         | Rust, Dart | 可用                           | 流量与余额监控，准入与准出，v4与v6；提供认证相关库；桌面端提供 CLI、CUI、GUI、Windows 服务、systemd 服务、launchd 服务；移动端提供 GUI |
> | [TsinghuaTunet](https://github.com/WhymustIhaveaname/TsinghuaTunet) | 支持 python 的平台， CLI                                     | Python     | 可用于特定子网                 | 未调查                                                       |
> | [auth-tsinghua](https://github.com/jiegec/auth-tsinghua)     | 支持 node.js 的平台, CLI                                     | Javascript | 不再维护                       | 已经重定向至 GoAuthing                                       |
> | [TsinghuaNet](https://github.com/Berrysoft/TsinghuaNet)      | Windows, Mac OS, Linux, UWP, Android, iOS                    | C#         | 不再维护                       | 已经重定向至 tunet-rust                                      |
> | [tunet-cli](https://github.com/syimyuzya/tunet-cli)          | 支持 python 的平台，CLI                                      | Python     | 不再维护，上个 commit 在2017年 | 未调查                                                       |
> | [Tsinghua-Online](https://github.com/xxr3376/Tsinghua-Online) | 浏览器插件，在[Chrome 商店](https://chrome.google.com/webstore/detail/tsinghua-online/elkbekfdkihpbcbacmppemegcekohkjo)中 | Javascript | 不再维护，上个 commit 在2013年 | 浏览器插件                                                   |
> | [THUNetwork](https://github.com/zhaofeng-shu33/THUNetwork)   | 支持 python 的平台， CLI                                     | Python     | 不再维护                       | 密码明文传入命令行，较为不安全                               |

最近刚好需要在无显示器的情况下，用SSH连接Linux Console连接校园网，于是就从中选择[GoAuthing](https://github.com/z4yx/GoAuthing/)进行使用了，下面简单记录一下配置。



### 下载选择

#### Linux发行版

一般Linux发行版上使用[GoAuthing](https://github.com/z4yx/GoAuthing/)，根据自己的平台选择对应的二进制文件即可，比如我是在armv6的CPU上运行的debian系统，就选择.armv6。linux平台上查看处理器类型命令是`uname -p`，可以根据命令输出选择。

![goauthing_down](../../../../assets/images/goauthing_down.jpg)

下载后记得用`chmod +x`给它运行权限。接下来创建文件`~/.config/auth-thu`并放入以下认证信息：

```json
{
  "username": "你的用户名",
  "password": "你的密码",
  "host": "",
  "ip": "",
  "debug": false,
  "useV6": false,
  "noCheck": false,
  "insecure": false,
  "daemonize": false,
  "acId": "",
  "campusOnly": false
}
```

然后就可以使用下面的命令测试认证信息

```bash
./auth-thu --debug auth -k
```

成功后就可以进入下一步。

#### Win用户

使用[tunet-rust](https://github.com/Berrysoft/tunet-rust)，有图形界面，无脑下载安装就行。



### 服务配置

#### Linux发行版

这里我在树莓派上使用了systemd在用户空间的service来配置连接，参考[这篇博客](https://blog.csdn.net/2301_79996063/article/details/138006614)和[这篇](https://www.baeldung.com/linux/systemd-create-user-services)。因为通常连接的是Tsinghua-IPv4的WiFi，所以还需要配置一下wpa_supplicant。在`/etc/wpa_supplicant/wpa_supplicant.conf`中加入以下内容：

```bash
network={
        ssid="Tsinghua-IPv4"
        key_mgmt=NONE
}
```

然后使用命令重启wpa_supplicant:

```bash
sudo systemctl restart wpa_supplicant
```

接下来配置自动认证服务。先在目录`~/.config/systemd/user/`下创建`goauthing.service`文件，按照[官方的配置](https://github.com/z4yx/GoAuthing/blob/master/docs/systemd/user/goauthing.service)编写：

```bash
[Unit]
Description           = Authenticating utility for auth.tsinghua.edu.cn
StartLimitIntervalSec = 0

[Service]
ExecStartPre = -"auth-thu路径" -D deauth
ExecStartPre = -"auth-thu路径" -D auth
ExecStartPre = -"auth-thu路径" -D login
ExecStart    = "auth-thu路径" -D online
Restart      = always
RestartSec   = 5

[Install]
WantedBy = default.target
```

最后运行以下命令，查看服务状态是否正常

```bash
systemctl --user daemon-reload
systemctl --user enable goauthing.service
systemctl --user start goauthing.service
systemctl --user status goauthing.service
```

#### Win用户

在安装的目录下打开Power Shell， 运行下面的命令注册服务即可。

```powershell
.\tunet-services register
```



### Win10开启SSH和RDP


教育网公网IP屏蔽了常用端口，如22(SSH)、80(Web)、3389(RDP)，需要更改其它端口连接，参考官方文档“[更改远程桌面的侦听端口 \| Microsoft Learn](https://learn.microsoft.com/zh-cn/windows-server/remote/remote-desktop-services/clients/change-listening-port)”。但是用密码连接可能会被爆破，所以推荐用SSH转发加一层SSL加密来增加安全性，可以参考[之前的博客](https://blog.liuyc.us.kg/2021/07/12/Remote-control)。


**1. 在被控主机上开启SSH并修改端口**

首先开启和配置ssh服务。打开文件夹`C:\ProgramData\ssh`，因为需要管理员权限，建议先复制在其它文件夹，然后编辑文件`sshd_config`，取消`#Port 22`的注释把端口改成别的：

```powershell
Port xxx #设置你的端口，最大65535
```

如果需要证书登录，找到和编辑用户组`administrators`

```powershell
Match Group administrators
       AuthorizedKeysFile __PROGRAMDATA__/ssh/administrators_authorized_keys
       PasswordAuthentication no
       PermitEmptyPasswords no
```

然后新建一个名为`administrators_authorized_keys`的文件，把**公钥**放进这个文件里，参考[官方文档](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh-server-configuration)。完成之后把`administrators_authorized_keys、sshd_config`两个文件放到`C:\ProgramData\ssh`中。为了保证能够打开一个提权的Power Shell，要在有管理员权限的cmd中运行下面的命令：

```powershell
icacls.exe "C:\ProgramData\ssh\administrators_authorized_keys" /inheritance:r /grant "Administrators:F" /grant "SYSTEM:F"
```

最后按下win+r打开services.msc，找到OpenSSH SSH Server和OpenSSH Authentication Agent服务，设置成自动然后启动。

**2. 在被控主机上开启远程连接RDP服务**

打开设置，搜索**远程桌面**然后启用即可，如图

![win_start_rdp](../../../../assets/images/win_start_rdp.jpg)

**3. 在主控端开启SSH本地转发并连接**

在另一台主机上备好**私钥**，开启ssh端口转发，例如：将本地的12345端口本地映射出来使用命令

```bash
ssh -L 12345:localhost:3389 -C -N -l your_username your_server_ip -p xxx #xxx为在1中设置的端口号
```

然后开启RDP客户端连接，地址选`localhost:12345`，输入用户名密码即可。实测感觉rdp比vnc速度更快，播放视频不卡，还有声音。





