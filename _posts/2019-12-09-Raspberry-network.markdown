---
layout: post
title: "树莓派网络转发"
date: 2019-12-09 20:11
disqus: true
categories: Raspberry&nbsp;Pi
---



> 记录下树莓派的一些常用网络设置



最近远程`ssh`连接树莓派时，用`tab`键补全命令会提示Read-Only File System，`umount`之后加`fsck`一顿操作竟然好了。可是过了没多久就不能重启系统了，依稀记起之前好像不小心摔了一下树莓派，估计是micro SD卡坏了，没办法又去淘宝新买了一张卡，然后重装系统。最新的Raspbian版本是Buster，用HDMI连屏幕看了下，感觉和之前的界面差不多，顺便说一下`raspi-config`命令真的好用。每次重装系统都要有一波惯例操作，先记录一下。



#### 更改国内源

1. 编辑 `/etc/apt/sources.list` 文件，删除原文件所有内容，用以下内容取代

   ```bash
   deb http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ buster main non-free contrib
   deb-src http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ buster main non-free contrib
   ```

2. 编辑 `/etc/apt/sources.list.d/raspi.list` 文件，删除原文件所有内容，用以下内容取代

   ```bash
   deb http://mirrors.tuna.tsinghua.edu.cn/raspberrypi/ buster main ui
   ```


然后输入命令

```bash
sudo apt-get update && apt-get upgrade
```

具体内容参考[清华镜像源](https://mirror.tuna.tsinghua.edu.cn/help/raspbian/)



#### 用树莓派当无线网卡

因为我们不是随身携带屏幕和HDMI线的，更多时候是用一条网线通过ssh来连接树莓派，所以先用`raspi-config`选择开启ssh。对于只有有线网卡的机器，我们可以用网线连接树莓派，然后将有线网卡的请求包全部转发到树莓派的无线网卡。大致思路就是上面所述，另外这个模式不能和下面的无线热点共存，所以要先决定好。

首先固定有线网卡的IP，这样每次我们就能`ssh`固定连接该IP。用编辑器打开`/etc/dhcpcd.conf`，需要超级用户权限。然后加入下面两行

```bash
interface eth0
static ip_address=192.168.12.1/24
```

这里静态IP地址也可以换成其它的局域网IP段。接下来重启networking服务，输入下面的命令

```bash
sudo service networking restart
```

成功后可以看到IP已经改变了。然后需要在树莓派有线网卡接口开启DHCP服务器，使得连接到树莓派的网卡获得局域网的IP地址。这里用到dnsmasq服务，使用下面命令安装

```bash
sudo apt-get update
sudo apt-get install dnsmasq -y
```

安装完成后备份和编辑配置文件

```bash
cd /etc
sudo mv dnsmasq.conf dnsmasq.d/dnsmasq.default
sudo nano dnsmasq.conf
```

这时候打开的应该是一个空白文件，加入下面内容

```bash
interface=eth0
dhcp-range=192.168.12.2,192.168.12.254,255.255.255.0,12h
```

按下`Ctrl + o`然后回车保存文件，再按下`Ctrl + x`退出nano。继续用下面的命令重启dnsmasq

```bash
sudo service dnsmasq restart
```

现在用网线连上树莓派，再用下面的ssh命令连接树莓派就可以了

```bash
ssh pi@192.168.12.1
```

等等，还有最后一步，转发所有的请求包到无线网卡。编辑`/etc/sysctl.conf`，取消下面这一行的注释

```bash
net.ipv4.ip_forward=1
```

新建一个ip_forward.sh，输入下面的内容保存

```bash
#!/bin/sh
iptables -t nat -A POSTROUTING -o wlan0 -j MASQUERADE
```

然后运行这个文件就可以了。为了方便也可以设置成开机启动。以上参考树莓派[networking lesson](https://github.com/raspberrypilearning/networking-lessons/blob/master/lesson-3/lesson.md)



#### 用树莓派当无线热点

注意这里的无线热点模式不能和上面的模式共存，需要先自行选择，然后按照下面操作进行。

首先装一下需要的软件，输入下面的命令：

```bash
sudo apt install dnsmasq hostapd
```

因为还没有配置好，先输入下面的命令把这两个服务禁用掉

```bash
sudo systemctl stop dnsmasq
sudo systemctl stop hostapd
```

然后让无线网卡使用静态IP，输入下面的命令打开配置文件

```bash
sudo nano /etc/dhcpcd.conf
```

加入下面几行

```bash
interface wlan0
    static ip_address=192.168.9.1/24
    nohook wpa_supplicant
```

用下面的命令重启`dhcpcd`使上面的配置生效

```bash
sudo service dhcpcd restart
```

接下来配置DHCP服务器，类似上面的操作，备份和编辑`dnsmasq`配置文件

```bash
cd /etc
sudo mv dnsmasq.conf dnsmasq.d/dnsmasq.default
sudo nano dnsmasq.conf
```

放入以下内容

```bash
interface=wlan0
dhcp-range=192.168.9.2,192.168.9.20,255.255.255.0,24h
```

然后重启`dnsmasq`服务

```bash
sudo systemctl reload dnsmasq
```

到这里和上面用作无线网卡的步骤差不多，只是把网卡接口换成了`wlan0`，接下来就是利用`hostapd`来开启热点。先编辑配置文件

```bash
sudo nano /etc/hostapd/hostapd.conf
```

输入下面的配置，里面的无线名称`ssid`和密码`wpa_passphrase`可以自己设置

```bash
interface=wlan0
driver=nl80211
ssid=NameOfWiFi                                                          
hw_mode=g                                                                       
channel=7                                                                       
wmm_enabled=1                                                                   
ieee80211n=1                                                                    
ieee80211ac=1                                                                   
macaddr_acl=0                                                                   
auth_algs=1                                                                     
ignore_broadcast_ssid=0                                                         
wpa=2                                                                           
wpa_passphrase=你的密码                                                         
wpa_key_mgmt=WPA-PSK                                                            
wpa_pairwise=TKIP                                                               
rsn_pairwise=CCMP 
```

然后保存，还需要告诉系统在哪找这个配置文件

```bash
sudo nano /etc/default/hostapd
```

找到下面这一行取消掉注释，填入下面的内容

```bash
DAEMON_CONF="/etc/hostapd/hostapd.conf"
```

保存之后就可以开启`hostapd`服务找到热点了

```bash
sudo systemctl unmask hostapd
sudo systemctl enable hostapd
sudo systemctl start hostapd
```

可以通过下面的命令查看开启服务的状态

```bash
sudo systemctl status hostapd
sudo systemctl status dnsmasq
```

应该就可以搜索到热点了，然后就可以连上有线网，将所有无线网的请求转发到无线网卡。先打开`/etc/sysctl.conf `，取消下面一行的注释

```bash
net.ipv4.ip_forward=1
```

新建一个脚本，输入下面的内容

```bash
#!/bin/sh
iptables -t nat -A  POSTROUTING -o eth0 -j MASQUERADE
```

然后运行这个脚本就可以了。为了方便也可以保存转发表建立桥接等操作，具体可以参考[官方文档](https://www.raspberrypi.org/documentation/configuration/wireless/access-point.md)



#### 开启PAC代理

大致思路是在树莓派上安装ss开启`socks`代理，然后把`proxy.pac`放到`apache`服务器上。

首先安装ss，这里略过相关的安装和服务器配置，安装和配置成功后一般都会开启本地的1080端口的`socks`代理。接下来安装`apache`服务

```bash
sudo apt-get install apache2
```

安装完成后打开网页`http://your_raspberry_pi_ip`应该可以看到`apache`的相关说明，然后把准备好的pac文件放到`/var/www/html`目录下面，注意pac文件里面的代理设置，里面的IP和端口号要对应。pac文件可以用switchOmega导出，但是还是要再次检查里面的代理设置，这里给出我的设置参考

```javascript
var proxy = "SOCKS 192.168.9.1:1080; SOCKS5 192.168.9.1:1080; DIRECT;";

var rules = [
]

var direct = 'DIRECT;';

function FindProxyForURL(url, host) {
  if (defaultMatcher.matchesAny(url, host) instanceof BlockingFilter) {
    return proxy;
  }
  return direct;
}
```

这样只要在手机或者电脑上的自动代理上面填上`http://your_raspberry_pi_ip/proxy.pac`（注意这里的文件名）就可以自动代理了。网页服务器参考[官方文档](https://www.raspberrypi.org/documentation/remote-access/web-server/apache.md)



#### 其它

等有其它操作再继续更新。。。

