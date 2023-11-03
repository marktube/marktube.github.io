---
layout: post
title: "安卓虚拟机装微X模块"
date: 2023-10-31 08:50
disqus: true
categories: Android
---

> ~~我太难了~~

### Gossip

因为看到了一个[微信模块](https://github.com/Xposed-Modules-Repo/com.fkzhang.wechatxposed)有各种神奇操作，于是突发奇想要去试一试。但是我手头上又没有安卓机，于是想起了本科课程移动软件开发，当时还下载过[Android Studio](https://developer.android.com/studio/archive?hl=zh-cn)搞安卓开发，里面有一个虚拟机可以很好地玩耍，于是爬坑之路开始了。。。

### 装微信爬坑

一开始我以为一切都是如此简单。我的工作环境是Ubuntu 20.04，直接官网下载了最新的Android Studio，拿到了一个压缩文件，解压后放到/opt/下面。为了方便还设置了一个桌面快捷方式如下：
```
[Desktop Entry]
 Name=Android-Studio
 Comment=Android-Studio
 Exec=/opt/android-studio/bin/studio.sh

Icon=/opt/android-studio/bin/studio.svg
 Type=Application
 Categories=Development;
 StartupNotify=true
 NoDisplay=false
```
然后右键Allow Launch后放进/usr/share/applications/就可以愉快的打开了！因为下载SDK和System Image需要梯子，所以需要提前设置一下代理。接下来我就随便挑了一个安卓版本下载玩耍了，先熟悉一下相关工具的命令：emulaor可以用来启动安卓虚拟机，命令语法是
```
emulaor -avd [avd名称] -writable-system
```
后面这个-writable-system是为了让文件系统可写，具体看emulaor文档。Debuger的常用调试命令有
```
adb root                                  #以root身份启动adb
adb shell                                 #进入安卓系统命令行
adb remount                               #重新挂载文件系统
adb push [本机文件路径] [虚拟机文件路径]   #把本机文件推送到虚拟机指定路径下
adb pull [虚拟机文件路径] [本机文件路径]   #把虚拟机文件拉到本机路径下
adb install [本机apk路径]                 #安装apk到虚拟机
```
于是我接下来就直接下载微信的apk，然后用adb安装，结果就g了。直接给我显示:
```
Performing Streamed Install
adb: failed to install /home/xxx/Downloads/weixin.apk: Failure [INSTALL_FAILED_NO_MATCHING_ABIS: Failed to extract native libraries, res=-113]
```
我拿着错误就去找搜索引擎了，原来我开的虚拟机是x86指令集，这个apk是arm指令集，运行不了！搜了半天终于找到一个[博客](https://blog.imlk.top/posts/wechat-in-avd-7-1-x86/)给出了解决方法，不多说直接开干。先开一了个Android 7.1.1 x86_64的avd，用emulaor启动它，然后把所需的文件拉下来
```
  ./adb pull /system/build.prop ~/Downloads/build.prop
```
接下来修改build.prop中的abi为
```
  ro.product.cpu.abilist=x86_64,x86,arm64-v8a,armeabi-v7a,armeabi
  ro.product.cpu.abilist32=x86,armeabi-v7a,armeabi
  ro.product.cpu.abilist64=x86_64,arm64-v8a
  persist.sys.nativebridge=1
```
然后把修改后的build.prop再push回去，别问我为什么不在adb shell里改。。。上面博客里说要改这个build.prop结果也没说在哪，我傻傻地跑去system-imgs里面瞎改一通，没有任何效果。接下来在adb shell里输入下面的命令：```getprop | grep -i abi``` ，应该会输出：
```
  [ro.product.cpu.abi]: [x86_64]
  [ro.product.cpu.abilist]: [x86_64,x86]
  [ro.product.cpu.abilist32]: [x86]
  [ro.product.cpu.abilist64]: [x86_64]
```
因为需要重启才能生效。然后运行以下命令：
```
  cd ~/Android/Sdk/system-images/android-25/default/x86_64
  cp ramdisk.img ramdisk_backup.img
  file ramdisk.img
  mv ramdisk.img ramdisk.img.gz
  gzip -d ramdisk.img.gz
  file ramdisk.img
  mkdir ramdisk
  cd ramdisk
  cpio -idmv < ../ramdisk.img
```
然后编辑文件夹里面的default.prop文件里面NativeBridge设置更改成
```
  ro.dalvik.vm.native.bridge=libhoudini.so
```
用工具重新打包
```
  mkbootfs /home/xxx/Android/Sdk/system-images/android-25/default/x86_64/ramdisk | gzip > ramdisk_new.img
```
然后下载[houdini7_y](https://github.com/SGNight/Arm-NativeBridge)，本机上mount和解压
- adb push到/data/arm/
- 打开adb shell，
```
  mv /data/arm/houdini7_y /system/lib/arm
  ln -s /system/lib/arm/libhoudini.so /system/lib/libhoudini.so
  mv /data/arm/houdini7_z /system/lib64/arm64
  ln -s /system/lib64/arm64/libhoudini.so /system/lib64/libhoudini.so
  mv /system/lib/arm/houdini /system/bin/
```
可惜最后装上微信后还是打不开![安装成功](../../../../assets/images/nexus5x.png)，logcat上看到错误是
```
11-01 12:22:35.689  2930  2930 F DEBUG   : *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
11-01 12:22:35.690  2930  2930 F DEBUG   : Build fingerprint: 'Android/sdk_phone_x86_64/generic_x86_64:7.1.1/NYC/4931657:userdebug/test-keys'
11-01 12:22:35.690  2930  2930 F DEBUG   : Revision: '0'
11-01 12:22:35.690  2930  2930 F DEBUG   : ABI: 'x86'
11-01 12:22:35.690  2930  2930 F DEBUG   : pid: 2902, tid: 2902, name: com.tencent.mm  >>> com.tencent.mm <<<
11-01 12:22:35.690  2930  2930 F DEBUG   : signal 11 (SIGSEGV), code 2 (SEGV_ACCERR), fault addr 0xdead0000
11-01 12:22:35.690  2930  2930 F DEBUG   :     eax 00000000  ebx ebd55ff4  ecx fff9eab0  edx f57a8170
11-01 12:22:35.690  2930  2930 F DEBUG   :     esi 00000008  edi 00000001
11-01 12:22:35.690  2930  2930 F DEBUG   :     xcs 00000023  xds 0000002b  xes 0000002b  xfs 0000006b  xss 0000002b
11-01 12:22:35.690  2930  2930 F DEBUG   :     eip ebaf064b  ebp 00000003  esp fff9eb30  flags 00000286
11-01 12:22:35.690  2930  2930 F DEBUG   : 
11-01 12:22:35.690  2930  2930 F DEBUG   : backtrace:
11-01 12:22:35.690  2930  2930 F DEBUG   :     #00 pc 0020564b  /system/lib/arm/libhoudini.so
11-01 12:22:36.077  1679  2343 E eglCodecCommon: glUtilsParamSize: unknow param 0x000082da
11-01 12:22:36.077  1679  2343 E eglCodecCommon: glUtilsParamSize: unknow param 0x000082da
11-01 12:22:38.038  2941  2941 E dex2oat : Could not create image space with image file '/system/framework/boot.art'. Attempting to fall back to imageless running. Error was: No place to put generated image.
```
一通操作猛如虎，结果前面全是白做。大概是houdini这个版本对指令的翻译不太好。没关系，咱再换个版本。在上面提到的博客中的enable_nativebridge脚本我修改了一些内容，放在后面的github资源里了。实际运行中我发现里面的短链接网址挂上梯子还是可以下载的，只是android shell不支持wget和mount命令。
经过我一个下午的摸索，终于找到了合适的版本，并安装和打开成功![打开成功](../../../../assets/images/weixin.png)，然后开始装微X模块。

### 装xposed框架爬坑

一开始我就找好了装xposed框架的[资源](https://blog.csdn.net/lingaoyi/article/details/127233402)，然而，这个资源是给x86_64的，于是我不得不再次用强大的搜索引擎找资源。一番搜索后，我利用之前下好的xposed-installer.apk先装到虚拟机里面，然后按照[教程](https://www.cnblogs.com/easywhite/p/17229297.html)放到指定文件夹，至此一切都很顺利。在我点击安装的时候，意外又发生了![安装失败](../../../../assets/images/xposed.png)仔细阅读一下，原来是没root，这个问题不大，再次交给万能的搜索引擎。

首先利用之前下载好的资源，把SuperSU里的x86文件夹解压出来，然后输入以下命令：
```
./adb push ~/Downloads/SuperSU/x86/su.pie /system/bin/su
./adb shell
su
cd /system/bin
chmod 06755 su
su --install
su --daemon
setenforce 0
exit
exit
```
然后在Xposed-installer里点击安装即可。最后下载[WeX模块](https://github.com/Xposed-Modules-Repo/com.fkzhang.wechatxposed)，adb安装一下即可，不要忘记重启一下。


### 技术路线

最后总结一下安装流程：
1. 下载Android 7.1.1 SDK 25 x86

2. emulator启动并用adb拷贝出/system/build.prop，修改后放回

3. 下载houdini7_x，用adb拷贝到/system/lib/arm，并在/system/lib/下创建软链接，再把houdini放到/system/bin

4. 叉掉emulator，修改ramdisk.img

5. 用修改后的ramdisk.img启动emulator

6. adb安转微信

7. root

8. 安装xposed框架

9. 装微x模块

![成功安装](../../../../assets/images/WeXinWechat.png)

最后分享一下安装成功用到的一些资源：[点我查看](https://github.com/marktube/Android7-Emulator-Resources)

免责声明：以上流程仅限技术交流，请勿用于非法行为！！！