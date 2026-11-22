---
layout: post-codie
title: 给老树莓派3B来一次大保健：摄像头监控、Docker和音乐服务器
date: 2026-11-22 10:00:00
disqus: true
categories: Raspberry&nbsp;Pi
---

> SD卡使用寿命能不能长点？


##### 环境与背景

设备是一台老当益壮的树莓派3B，最近因为SD卡坏了，进系统发现根目录成了只读模式，遂换SD卡重装系统。系统相当新：Raspbian GNU/Linux 13 (trixie)，内核 6.18.60+rpt-rpi-v7。摄像头是 CSI 口的 IMX219 模块，另有一块 exfat 格式的 U 盘挂在 `/mnt/Mobile`（存音乐和监控截图）。先看一眼硬件底子：

```bash
vcgencmd get_camera        # 固件层摄像头状态
rpicam-hello --list-cameras
free -h && df -h /         # 920MB 内存，量力而行
```

SSH 免交互连接用了个小技巧：密码只放环境变量，通过 `SSH_ASKPASS` 喂给 ssh，全程不进 argv、不进 shell history：

```bash
cat > /tmp/askpass.sh <<'EOF'
#!/bin/bash
printf '%s\n' "$PI_PASSWORD"
EOF
chmod 700 /tmp/askpass.sh
SSH_ASKPASS=/tmp/askpass.sh SSH_ASKPASS_REQUIRE=force \
  ssh pi@10.42.0.38 'uname -a'
```

##### 摄像头踩坑：trixie 的 libcamera 之墙

motion 装好就报错，日志里每 10 秒重试一次：

```text
[ERR] v4l2_device_capability: Not a V4L2 device?
[ERR] vid_start: V4L2 device failed to open
```

排查发现根源：trixie 默认走 **libcamera** 摄像头栈，`/dev/video0` 是 `unicam-image`（CSI 裸收流器），只吐 10-bit Bayer 裸流；而 motion 是传统 V4L2 应用（二进制里根本没链接 libcamera），完全吃不下。`vcgencmd get_camera` 也显示 `supported=0 detected=0`。

解法是切回**传统固件摄像头栈**（legacy stack），让 GPU 的硬件 ISP 出一个正经的 YUV 设备。编辑 `/boot/firmware/config.txt`：

```bash
start_x=1                  # 启用 legacy 固件摄像头
gpu_mem=128                # 摄像头吃显存，默认 64M 不够
camera_auto_detect=0       # 关掉！否则内核 imx219 驱动抢占传感器，
                           # 固件反而 detected=0（亲测的坑）
```

重启后验收：

```bash
vcgencmd get_camera
# supported=1 detected=1, libcamera interfaces=0
cat /sys/class/video4linux/video0/name
# camera0  <- 从 unicam-image 变成了 MMAL 捕获设备
v4l2-ctl -d /dev/video0 --list-formats-ext   # YU12/YUYV/RGB 随便挑
```

代价是 `rpicam-*` 这套 libcamera 工具从此看不到摄像头了，两者只能二选一。对监控场景来说，GPU 硬件 ISP 的 legacy 路线 CPU 占用低得多，值。

##### motion 三连坑：挂载、权限、systemd

摄像头通了，motion 却还是起不来，日志直接断在启动阶段。连环坑如下：

**坑一：U 盘挂载不上。** fstab 里 `nofail` + `x-systemd.device-timeout=5s`，而 USB 盘枚举要 13 秒——开机时挂载静默失败，motion 以专用用户身份连日志文件都创建不了，直接 EMERGENCY 退出。超时提到 30s，顺便解决第二个问题：挂载参数是 `uid=1000`，`motion` 用户照样没有写权限，补上 `umask=002` 再把 `motion` 拉进对应用户组：

```bash
# /etc/fstab 中该 U 盘一行改成：
UUID=<UUID>  /mnt/Mobile  exfat  defaults,nofail,x-systemd.device-timeout=30s,uid=1000,gid=1000,umask=002  0  0
sudo usermod -aG <uid1000对应组名> motion
```

**坑二：systemd unit 被前人改过。** `ExecStart` 被包了一层 `libcamerify`（一个用 LD_PRELOAD 把 libcamera 伪装成 V4L2 的 shim）。legacy 栈下它是多余甚至添乱的，还原为 `/usr/bin/motion`。

**坑三：`daemon on` 与 systemd 打架。** 配置里 motion 自带守护进程化，systemd 发 SIGTERM 它理都不理，超时被 SIGKILL，服务状态变成 failed。Debian 的规矩是 **systemd 托管时必须 `daemon off`**，再配个自愈：

```bash
# /etc/motion/motion.conf
daemon off

# /etc/systemd/system/motion.service.d/override.conf
[Service]
Restart=on-failure
RestartSec=5
```

`systemctl daemon-reload && systemctl restart motion` 之后，日志里终于出现了久违的：

```text
[NTC] v4l2_pixfmt_set: Using palette YU12 (640x480)
[NTC] motion_detected: Motion detected - starting event 1.
```

![motion 抓拍样张：事件触发自动落盘，左下角带 CAMERA1 水印与时间戳](../../../../assets/images/raspi-motion-capture.jpg)

顺带提一句 motion 的取流认证：`stream_auth_method 2` 是 **Digest** 而不是 Basic，用 curl 测试时要加 `--digest`，不然永远 401，还以为是自己密码错了。

##### 存图推送 Telegram 与家目录权限

给 `on_picture_save` 挂了个推送脚本：存图成功就调 Telegram Bot API 发文字 + 照片。脚本大意如下（token 之类自备）：

```bash
#!/bin/bash
# send_notify.sh <图片路径>
curl -sS -X POST -H "Content-Type: application/json" \
  -d "{\"chat_id\": \"<CHAT_ID>\", \"text\": \"Motion detected: $1\"}" \
  https://<你的BotAPI地址>/bot<TOKEN>/sendMessage

curl -sS -F "chat_id=<CHAT_ID>" -F "photo=@$1" \
  https://<你的BotAPI地址>/bot<TOKEN>/sendPhoto
```

这里又埋了一坑：脚本放在 `/home/pi/Workspace/` 下，`-rwxrwxr-x` 看着没问题，motion 却次次 `Permission denied`——因为 **`/home/pi` 本身是 700**，`motion` 用户连家目录都穿不进去。journalctl 里能看到 motion 每次都尽职尽责地尝试执行然后被拒。标准解法是把脚本安装到公共位置：

```bash
sudo install -m 755 -o root /home/pi/Workspace/send_notify.sh \
  /usr/local/bin/send_notify.sh
# motion.conf 里改为：
on_picture_save /usr/local/bin/send_notify.sh %f
```

![从 motion 内置 MJPEG 流实时抽取的一帧——拉流记得带 --digest](../../../../assets/images/raspi-motion-stream.jpg)

顺便，脚本里 `curl` 记得加 `-sS`，否则每次触发，curl 的进度条都会刷进 systemd journal。

##### Docker 安装与网络现实

Docker 本身毫无难度，raspbian 源里就有：

```bash
sudo apt-get install -y docker.io
sudo usermod -aG docker pi
docker info --format 'server={\{.ServerVersion\}} storage={\{.Driver\}}'
# server=26.1.5 storage=overlay2 cgroup=2
```

难的是网络：Docker Hub 在国内被 DNS 污染（`registry-1.docker.io` 直接解析到一个 Facebook 的 IP，TLS 握手当然报证书错误），几个常见的国内镜像站能拉到 manifest，但它们的 **blob CDN 域名**同样被污染，拉到一半照样断。最终实测可用的办法是走 `dockerproxy.net` 这类代理前缀：

```json
// /etc/docker/daemon.json
{
  "registry-mirrors": ["https://dockerproxy.net"]
}
```

另外有个吓人但不致命的插曲：apt 装新包时 `needrestart` 会自动重启"使用了过期库"的服务，motion 因此被重启过一次；配合上面 `Restart=on-failure` 之后就不怕了。

##### 旧 navidrome 音乐库迁入容器

U 盘上有一套裸二进制时代跑起来的 navidrome：`navidrome.db` + `-wal` + `-shm` 三件套躺在数据目录里，音乐库 2.8G、四百多首歌，没有任何 toml 配置。迁移要点有三：

1. **WAL 三件套必须一起拷**——`-wal` 文件比主库还大，最新数据都在里面，缺一个就丢数据。确认旧进程不在跑之后整组拷贝；
2. **音乐目录挂载到与旧安装相同的绝对路径**，避免数据库里遗留的封面、歌单位置漂移；
3. 新版首启会自动做 SQLite schema 升级并触发一次全量扫描，用户、播放记录、收藏、歌单全部保留。

```bash
mkdir -p /mnt/Mobile/navidrome-data
cp -a /mnt/Mobile/navidrome.db{,-wal,-shm} /mnt/Mobile/navidrome-data/

docker run -d --name navidrome --restart unless-stopped \
  -p 4533:4533 \
  -v /mnt/Mobile/navidrome-data:/data \
  -v /mnt/Mobile/Music:/mnt/Mobile/Music:ro \
  -e ND_MUSICFOLDER=/mnt/Mobile/Music \
  deluan/navidrome:latest
```

首启日志里十几个 migration 依次 OK，3 分钟扫完全库：407 个文件处理、406 首导入、0 丢失、286 张专辑刷新。唯一一颗痣是个别 m4a 文件的标签读取失败（navidrome 的 WASM taglib 插件报 memory error 后自动跳过），不影响其他任何文件。文件系统 watcher 是开着的，以后往音乐目录加歌会自动增量扫描。

![Navidrome 登录页（浏览器实测截图）：旧账号原样登录，一点没变](../../../../assets/images/raspi-navidrome-web.png)

##### RDP 远程桌面

trixie 的 Pi OS 桌面默认是 Wayland（labwc），xrdp 直接对接不了，但系统里自带 openbox 的 X11 会话兜底，xrdp 用 xorgxrdp 后端可以独立于控制台开图形会话——Pi 默认启动到命令行（`multi-user.target`）也完全不影响：

```bash
sudo apt-get install -y xrdp xorgxrdp
sudo systemctl enable --now xrdp xrdp-sesman
ss -ltn | grep 3389     # 0.0.0.0:3389
```

Windows 自带的 mstsc 直连，用 pi 账号登录即见桌面。

##### 重启韧性验收

改完不重启验证等于没改。整机重启后逐项确认，全部自恢复：

| 检查项 | 命令 | 结果 |
| ------ | ---- | ---- |
| 摄像头固件栈 | `vcgencmd get_camera` | supported=1 detected=1 |
| U 盘自动挂载 | `findmnt /mnt/Mobile` | 30s 超时内挂载成功 |
| motion | `systemctl is-active motion` | active，8765 取流正常 |
| Docker | `systemctl is-active docker` | active，26.1.5 |
| navidrome | `curl -I http://<pi>:4533` | 302 → /app 200 |
| RDP | 3389 端口 / X.224 握手 | 协议栈应答正常 |

![重启验收当天清晨从实时流抽下的画面——全部服务自恢复，岁月静好](../../../../assets/images/raspi-motion-morning.jpg)

##### 花絮：一个"闹鬼"瞬间

用 `echo "$PW" | sudo -S bash -s` 喂密码时，屏幕上偶尔冒出一条把密码字符串当命令执行的 `command not found`。真相是：sudo 有 15 分钟的时间戳缓存，**缓存命中时它根本不读 stdin**，那行密码就原封不动漏给了后面的 `bash -s` 被当脚本执行了。同一段代码时灵时不灵，全看缓存脸色——教训是喂 sudo 的密码和喂 bash 的脚本永远别走同一条 stdin，脚本先落盘再执行最稳。另外连续密码错误会触发 pam_faillock 锁账户，别问我怎么知道的。

__以上操作仅用于学习和个人设备管理，摄像头监控请注意遵守当地法律法规并尊重他人隐私!__


***

###### Reference:

[motion 项目](https://motion-project.github.io/)

[navidrome 项目](https://www.navidrome.org/)

[Raspberry Pi legacy camera 模式](https://www.raspberrypi.com/documentation/computers/config_txt.html)

[xrdp](https://github.com/neutrinolabs/xrdp)

[docker registry mirror 配置](https://docs.docker.com/registry/recipes/mirror/)

***

###### 落款:

![落款](../../../../assets/images/raspi-dsh-working.png)

本篇所有诊断、修复与验证均由 **DeepSeek Harness**（DeepSeek 会话 AI 助手）通过 SSH 在树莓派上远程完成——从读日志定根因、改配置、修权限，到按下重启做全链路验收；作者负责提出需求、保管凭据与验收点赞。

*—— DeepSeek Harnessss 2026-11-22，于 树莓派 上空*
