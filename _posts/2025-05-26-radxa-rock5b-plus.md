---
layout: post
title: 国产树毒派上手体验
date: 2025-05-26 09:50:02
mathjax: false
disqus: true
categories: SBC
---


> ~~国产之光~~

作为一个树莓派用户，在经历了树莓派4和5挤牙膏的提升之后，终于将目光转向了国产派。先总结一下，除了芯片比较厉害之外，软件和文档适配完全不如树莓派，国产还有很长的路要走。

### 镜像选择
1. 安卓：比较简单，适合玩游戏
2. 官方瑞莎系统：软件文档可查
3. Armbian：适合自己DIY
4. Ubuntu：[网络版本](https://joshua-riek.github.io/ubuntu-rockchip-download/)

安卓装了感觉很流畅，然后试试官方的瑞莎系统。

### 修改密码
按照[官方文档](https://docs.radxa.com/rock5/rock5b/getting-started/basic-software-conf)设置成功。

### 开启ssh
按照[官方文档](https://docs.radxa.com/rock5/rock5b/getting-started/basic-software-conf)设置成功。但是要注意，如果使用无屏模式，记得在`/config/config.txt`中加入下面的部分使得开机自动启动ssh服务，否则开机需要登录后才有ssh服务。
```bash
# Connect to Wi-Fi
# Command:
#   connect_wi-fi <network name> [password]
#
#connect_wi-fi private_network password
if headless enable_service ssh
```
具体细节参考[官方文件](https://github.com/radxa-pkg/rsetup/blob/main/config/before.txt)


### 开启GPU驱动

按照[官方文档](https://docs.radxa.com/rock5/rock5b/radxa-os/mali-gpu?Driver=Mali)开启。~~若要使KDE桌面支持GPU加速，可按照[这里](https://www.shjdgwj.cn/14733f4e12d9/)的方法开启~~。

|Driver |OpenGL|OpenGL ES|OpenCL|8K HDMI|Vulkan|
|:-----:|:----:|:-------:|:----:|:-----:|:----:|
|Mali	|  ❌  |    ✔   |    ✔|	✔|	✔|
|Panthor|✔    |✔       |❌	|❌	|❌    |

目前的桌面环境KDE不支持Mali驱动的GPU加速，但是Panthor驱动支持。一些应用也不支持在Mali的驱动上面跑。

### 开启RDP
瑞莎系统自带KDE和gnome桌面，GNOME 会话对 systemd 和 Wayland 依赖大，不推荐远程登录。

建议改用自带的KDE，更稳定、兼容性强：

```bash
sudo apt install sddm xrdp
echo "startplasma-x11" > ~/.xsession
```

在显示器连接情况下请不要用同一用户连接，会导致黑屏！别问我为什么知道。因为远程的rdp只支持x11，所以wayland桌面只能作罢。但是某些应用可能需要用到wayland才能开启UI，例如Waydroid，这时候就需要安装weston了。


### 开启Samba
按照[官方文档](https://docs.radxa.com/rock5/rock5b/radxa-os/software)设置成功。

### 添加输入法
按照[官方文档](https://docs.radxa.com/rock5/rock5b/getting-started/basic-software-conf)设置成功。

### 风扇管理
参照[官方文档](https://docs.radxa.com/rock5/rock5b/getting-started/interface-usage/fan)设置成功。

### 开启热点
#### 编译rtl8188无线网卡驱动
因为我使用的是RealTek RTL8188eus无线网卡，插入USB后使用命令

```bash
lsusb
```
查看具体网卡型号和驱动，参考[这里](https://www.zhihu.com/question/36045840)。然后去GitHub上下载和编译驱动，命令如下：

```bash
git clone https://github.com/aircrack-ng/rtl8188eus
cd rtl8188eus
sudo apt install linux-headers-`uname -r`
sudo make && sudo make install
```

装完后重启即可。

#### 编译安装r8125-dkms驱动
rock5b+自带的是`Realtek Semiconductor Co., Ltd. RTL8125 2.5GbE`有线网卡，可以通过命令

```bash
lspci | grep -i ethernet
```

来查看有线网卡型号。接下来就是类似上面的找驱动和编译，命令如下：

```bash
git clone https://github.com/awesometic/realtek-r8125-dkms.git
cd realtek-r8125-dkms
sudo ./dkms-install.sh
```

#### 利用自带软件开启
参照[官方文档](https://docs.radxa.com/rock5/rock5b/radxa-os/ap)设置成功。如果使用命令行，可以先通过UI创建好配置文件，然后需要分别运行下面命令：

```bash
echo 密码 | nmcli connection up 配置文件名 --ask
iptables -t nat -A POSTROUTING -o 出口网卡 -j MASQUERADE
```

#### 安装docker版本openwrt进行管理

失败了，苦呀西。但是过程可以记录一下，参考[这里](https://stevexmh.net/posts/2022/05-17-%E9%80%9A%E8%BF%87docker%E8%BF%90%E8%A1%8Copenwrt%E5%B9%B6%E5%AE%9E%E7%8E%B0%E8%BD%AF%E8%B7%AF%E7%94%B1/)。

##### 需求目标
目前已有：

- wlx0c82680ba357：连接宽带，作为 WAN。

- wlP2p33s0：已配置为 AP 热点，用户设备连接至此。

希望通过 Docker 中运行的 OpenWRT 管理热点下的设备（如 DHCP、NAT、防火墙等）以及透明代理等。

##### 方案核心

将`wlP2p33s0` 通过宿主机发放wifi热点并桥接出网口，然后配置openwrt的lan口为桥接网口，从而作为这部分网络的软路由。但是不能用nmcli工具配置热点，因为无法桥接管理，具体看[这篇回答](https://unix.stackexchange.com/questions/219887/how-to-create-wireless-bridge-connection-with-nmcli)。hostapd可以这么干，但是需要特定网卡（支持4addr/WDS）。这些都不满足目前的要求，最终方案只能使用编译好的openwrt镜像，在容器内映射宿主机网卡，并装驱动开热点下面的配置仅供参考。

##### 配置步骤

+ 创建docker容器：

```bash
# 开启混杂模式
sudo ip link set enP4p65s0 promisc on
# 获取rock5b的openwrt镜像, 可前往 https://openwrt.ai 寻找最新镜像地址替换
wget https://dl.openwrt.ai/releases/24.10/targets/rockchip/armv8/kwrt-06.01.2025-rockchip-armv8-radxa_rock-5b-rootfs.tar.gz
docker import ./kwrt-06.01.2025-rockchip-armv8-radxa_rock-5b-rootfs.tar.gz kiddin9_openwrt
# 使用有线网络作为wan出口
docker network create -d macvlan -o parent=enP4p65s0 openwrt-wan
# 容器内需要管理网络（如 DHCP、iptables）
docker run -d --name openwrt --network openwrt-wan --privileged kiddin9_openwrt /sbin/init
docker exec -it openwrt bash
nano /etc/config/network
# 修改成下面的内容
config device
        option name 'eth1'
        option type 'bridge'
        list ports 'eth0'
        option promisc '1'

config interface 'wan'
        option device 'eth1'
        option proto dhcp

# 然后容器就可以上网了可以试试ping baidu.com

```

+ 宿主机启动WiFi, 并创建veth：

```bash
#创建 veth 对
sudo ip link add veth-host type veth peer name veth-openwrt
# 给 veth-host 分配 IP
sudo ip addr add 10.12.0.2/24 dev veth-host
sudo ip link set veth-host up
```

+ 配置容器地址

```bash
# 将另一端挂载入容器
PID=$(docker inspect -f '\{\{.State.Pid\}\}' openwrt)
sudo ip link set veth-openwrt netns $PID
# 配置容器内网卡（veth-openwrt）
sudo nsenter -t $PID -n ip addr add 10.12.0.1/24 dev veth-openwrt
sudo nsenter -t $PID -n ip link set veth-openwrt up
```

+ 宿主机和容器开启NAT转发以及防火墙

```bash
# 启用 IP 转发
#echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward
#sudo nsenter -t $PID -n sysctl -w net.ipv4.ip_forward=1
# 关闭防火墙后测试
#docker exec openwrt /etc/init.d/firewall stop
#ping 10.12.0.1
# 在容器内给veth-openwrt添加接口
docker exec -it openwrt bash
uci set network.veth_if=interface
uci set network.veth_if.ifname='veth-openwrt'
uci set network.veth_if.proto='static'
uci set network.veth_if.ipaddr='10.12.0.1'
uci set network.veth_if.netmask='255.255.255.0'
uci commit network
# 重启防火墙
uci add_list firewall.@zone[1].network='veth_if'
uci commit firewall
/etc/init.d/network restart
/etc/init.d/firewall restart
```

### DDNS

因为瑞莎系统使用的是**Network Manager**，可以利用本身的hook来运行ddns脚本。参考[这里](https://blog.sbw.so/u/nm-dispatcher-auto-switch-between-wifi-ethernet.html)实现dhcp client在分配到ip结束后运行指定脚本。

```bash
man NetworkManager-dispatcher
```

可以查看相关的功能，然后记得启用该服务

```bash
sudo systemctl enable NetworkManager-dispatcher.service
sudo systemctl start NetworkManager-dispatcher.service
```

具体脚本如下：

```bash
#!/bin/bash

#$1是网卡
#$2是触发的action
if [ "$1" = "网卡名" ]; then
    case "$2" in
        dhcp4-change)
            ipvfour=`ip addr show 网卡名 | grep 'inet ' | awk '{print $2}' | awk -F '/' '{print $1}' `
            curl "https://api.cloudflare.com/client/v4/zones/域名id/dns_records/dnd记录ID" -X PATCH -H "Content-Type:application/json" -H "Authorization: Bearer API密钥"  -d "{\"comment\": \"Domain verification record\",\"content\": \"$ipvfour\",\"name\": \"域名\", \"proxied\": false, \"ttl\": 3600, \"type\": \"A\"}"
            ipvfourt=${ipvfour//./\\\\.}
            curl -X POST -H "Content-Type: application/json" -d "{\"chat_id\": \"目标id\", \"text\": \"Dear Doctor: Your *IP address* changed to ipv4: $ipvfourt\", \"parse_mode\": \"MarkdownV2\"}"  https://t.me/your_bot_api_key/sendMessage
            ;;
    esac
fi
```

### 串口测试

按照[官方文档](https://docs.radxa.com/rock5/rock5b/radxa-os/serial)测试成功。

### 摄像头

参考[官方文档](https://docs.radxa.com/en/rock5/rock5c/app-development/rtsp)，编译安装ffmpeg。
首先安装v4l-utils：

```bash
sudo apt update
sudo apt install v4l-utils
```

树莓派摄像头可以安装拍照，但是motion打不开设备，GG。

### 蓝牙音频

不能连接Airpods pro。而且KDE自带的蓝牙管理器太难用了，显示一串地址无法找到设备。。。参考[这个](https://doc.embedfire.com/linux/imx6/base/zh/latest/linux_iot/bluetooth.html)

### 大模型部署

待测试。。。

### redroid游戏
根据[redroid官方部署文档](https://github.com/remote-android/redroid-doc/blob/master/deploy/README.md)，需要先找一个ubuntu编译镜像。
然后按照[官方的教程安装scrpy](https://github.com/Genymobile/scrcpy/blob/master/doc/linux.md)，编译镜像还是太费事了，所以我选择用别人编译好的。
先装docker：

```bash
sudo apt install docker.io -y #安装 docker
sudo usermod -aG docker $USER
sudo chmod a+rw /var/run/docker.sock
```

再加docker镜像：

```bash
sudo mkdir -p /etc/docker
sudo nano /etc/docker/daemon.json
```

编辑`daemon.json`文件，加入以下内容：

```bash
{
  "registry-mirrors": ["https://docker.nw.ip-ddns.com"]
}
```

使用`docker info`命令查看是否有镜像地址。**记得一定要先开启Mali显卡驱动！！！**
然后开启容器：

```bash
sudo docker run -itd --privileged \
    --name redroid \
    -v /data:/data \
    -v /dev/mali0:/dev/mali0 \
    -p 5555:5555 \
    iceblacktea/redroid-arm64:12.0.0-250116 \
    androidboot.redroid_gpu_mode=mali \
    androidboot.redroid_radio=1 \
    androidboot.redroid_wifi=1 \
    androidboot.redroid_wifi_gateway=10.100.200.1/24 \
    androidboot.redroid_magisk=1
```

注意`/data`目录一定要干净！！！而且要加`sudo`权限！镜像可以成功开启，但是因为使用了Mali的驱动，OpenGL支持不完全(只支持了OpenGL ES)，所以abd可以连上但是scrpy不能显示。

### Waydroid软件渲染

因为redroid失败，所以尝试使用waydroid。waydroid也可以用，但是只能用软件渲染。具体步骤参考[armbian的教程](https://forum.radxa.com/t/armbian-the-best-arm-framework/14979)和[OrangePi5Plus的教程](https://juejin.cn/post/7389229430345728035)。
接下来讲讲详细步骤。首先按照[官方教程](https://docs.radxa.com/rock5/rock5b/radxa-os/mali-gpu?Driver=Panfrost%2FPanthor)将GPU驱动切换到panthor,启用psi，按照[官方文档](https://docs.radxa.com/rock5/rock5b/radxa-os/bootparam)进行启用

```bash
sudo nano /etc/kernel/cmdline   # 添加或修改你所需要的选项
# 在最后加入 psi=1即可
sudo u-boot-update  # 执行命令以更新启动参数
```

设置好后重启系统：

```bash
# 可以使用 cat /boot/extlinux/extlinux.conf 检查参数
sudo reboot
```
然后安装waydroid:
```bash
sudo apt install curl ca-certificates -y
curl https://repo.waydro.id | sudo bash
sudo apt install waydroid -y
```

但是安装时会出现`init falied`的提示，没关系，需要我们配置一下镜像再重试，如下：

```bash
wget https://github.com/WillzenZou/armbian_fork_build/releases/download/willzen-armbian-24.5.0/2.waydroid-panthorv10-240416-v1.img.tar.gz
sudo mkdir -p /usr/share/waydroid-extra/images
sudo tar -xf 2.waydroid-panthorv10-240416-v1.img.tar.gz -C /usr/share/waydroid-extra/images
sudo waydroid init -f -i /usr/share/waydroid-extra/images
```

因为GPU加速不能用，只能软件渲染，所以这里要编辑配置文件进行软件渲染：

```bash
sudo nano /var/lib/waydroid/waydroid_base.prop
```

将这个文件里的`ro.hardware.gralloc=gbm`和`ro.hardware.egl=mesa`修改成
`ro.hardware.gralloc=default ro.hardware.egl=swiftshader`
然后重启waydroid container

```bash
sudo systemctl restart waydroid-container
```

因为rdp不支持waydroid，所以需要用到weston，先安装
```bash
sudo apt install -y weston
```

接着打开weston

```bash
weston > log.txt 2>&1 &
```

可以看到弹出了窗口，在窗口里打开终端开启waydroid会话

```bash
waydroid session start
```

开另一个终端输入下面命令开启安卓容器画面即可

```bash
waydroid show-full-ui
```

实测下来卡卡的，并没有那么流畅，只能当玩具。

### 一些参考

[1](https://neucrack.com/p/466)

[2](https://stevexmh.net/posts/2022/05-17-%E9%80%9A%E8%BF%87docker%E8%BF%90%E8%A1%8Copenwrt%E5%B9%B6%E5%AE%9E%E7%8E%B0%E8%BD%AF%E8%B7%AF%E7%94%B1/)

------

最近刷了armbian，蓝牙体验非常好！
