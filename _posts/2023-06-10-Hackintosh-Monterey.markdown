---
layout: post
title: "黑苹果，也许将成为时代的眼泪"
date: 2023-06-10 15:33
disqus: true
categories: Computer
---

> ~~大人，时代变了！~~

<center>
  <iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=2075896544&auto=1&height=66"></iframe>
</center>


### 市场和用户

个人电脑（PC）市场从兴起开始，一路乘着摩尔定律的东风，充满了竞争和发展。然而英特尔加微软的组合拳下来，苹果公司也招架不住。由于移动端和PC端良好的软件生态，很多用户也会选择Macbook系列，但是同样价位的笔记本，性能上与其它厂商相比，不能说是遥遥领先，也应当是十分拉胯（加个差的显卡水果公司多收几千？加几百G硬盘又多收几千？）。尤其是独立显卡方面，还有游戏和office软件。于是黑苹果（Hackintosh）出现了，我只能说真香。下图是mbp的售价表：

![mbp售价](../../../../assets/images/mbp_price.jpg)



从硬件上来看，水果公司为iPhone手机设计了A系列的芯片。但是在笔记本领域，还是不得不屈服于市场，为Macbook装上了Intel奔腾的芯。这使得一众英特尔加微软的用户在自己的笔记本上安装Mac OS成为可能。（~~资本的力量还是不可小觑~~）不是MBP买不起，而是黑苹果更有性价比！唯一让人头痛的是一些其它的驱动问题，尤其是显卡，主流的英伟达显卡很多都无法驱动，但是集显也不是不能用。一些无线网卡、声卡、触摸板、键盘和蓝牙模块也有一定的问题。然而特别的引导工具和一些硬件对Mac OS系统的支持使得大多数这些外设可以运行起来。



近些年，苹果自己开始生产M系列的芯片，让黑苹果的未来蒙上了一层阴影。后续的苹果可能在所有机型上用M系列芯片取代Intel使得黑苹果永远止步于老旧的系统上，而黑苹果也许终将成为时代的眼泪。但是，相信在苹果和微软等PC厂家的竞争中，用户们会诚实地选择，从而让厂商们重新审视PC市场给出更合理的价格和更出色的硬件。



### 我的丐版MBP

先从硬件来看，我的笔记本还是早几年买的XPS9570

| 硬件信息 |          型号           | 能否驱动 |
| :------: | :---------------------: | :------: |
|   CPU    |  i7-8750H Coffee Lake   |    ✅     |
|   集显   | Intel UHD Graphics 630  |    ✅     |
|   独显   |    Nvidia GTX1050Ti     |    ❌     |
|   网卡   |  Killer Wireless 1535   |    ❌     |
|   内存   |     16G 2667Hz DDR4     |    ✅     |
|   硬盘   | Segate 2TB 机械移动硬盘 |    ✅     |
|  显示器  |      Touch 4K 夏普      |    ✅     |

因为容量的问题，我把系统装在了移动硬盘上，Mojave时还行，后面明显感觉速度较慢，还是固态更丝滑。

引导程序早些年大家都用的变色龙，后面UEFI启动出来了，大家又转向Clover，目前用的比较多的是OpenCore。通常情况下，需要先在硬盘上划分一个EFI分区，然后将配置好的文件放进去，最后在BIOS里设置启动项就可以了。一些常用的笔记本配置在[Github](https://www.github.com)上都有大神分享配置文件，还有[远景](https://www.pcbeta.com)、[黑果小兵](https://blog.daliansky.net)等论坛社区资源。一些懒人版镜像甚至都把EFI分区刻进了镜像文件，并添加了一些额外驱动，更方便安装，是名副其实的懒人版本。

安装教程和资源网上已经存在很多，这里就不再赘述，主要把一些安装时的问题小小总结一下。

- PM981硬盘一定要屏蔽!!!不然会遇到系统不稳定常常崩溃的问题，具体屏蔽方法参考[这里](https://hpglw.com/pm981-evo970plus-hackintosh-fix-1.html)，我这里直接采用[SSDT屏蔽法](https://apple.sqlsec.com/6-%E5%AE%9E%E7%94%A8%E5%A7%BF%E5%8A%BF/6-8.html)
- 安装时会多次重启，重启后在OC选择界面记得选择mac OS Installer来继续安装，耐心等待，中间安装时间可能持续半小时到一小时。
- 登录AppStore和iCloud的会出现一直连接不上，很有可能是没有内建无线网卡，而不是网络的问题。笔记本无线网卡无法驱动的话，USB网卡能驱动也可以，但是要安装NullEthernet.kext。亲测开机后还要插拔一下USB网卡才能获取到IP地址。
- 蓝牙一般也是可以驱动的，需要BlueToolFixup.kext。
- 因为我的硬盘是机械硬盘，在驱动上没有使用NVMefix.kext，但是在实际开机中经常有APFS的trim，使得开机时间大大增加，遂在OC中把SetApfsTrimTimeout设置成0。
- 谨慎使用NVRAM相关选项，搞不好会使得电脑出现一些问题。我是在一次失败安装后关机风扇狂转，系统时间也不对（需要重置实时时钟RTC）。这时候要使用笔记本品牌官方的方法来清空NVRAM，然后把ResetNvramEntry.efi取消。DELL XPS的方法是移除电源之外所有外设，关机，然后长按电源键30s——35s。
- Monterey之后的系统好像把用户数据和系统数据分开了，如果系统出现问题重新安装后可以保留数据。新安装后不用急着马上把安装U盘抹掉。
- 系统时间设置最好把Set date and time automatically关掉，不然系统容易寄。
- 睡眠唤醒什么的还是不太行，网上找找其它方法没准可行。关闭啰嗦模式可以在boot-args里把-v去掉。
- 键盘可用但是触摸板不行，可以看[OpenCore官方解决方法](https://dortania.github.io/OpenCore-Install-Guide/troubleshooting/extended/kernel-issues.html#keyboard-works-but-trackpad-does-not)，根据自己的DSDT文件编写SSDT-GPIO.aml来解决。
- IRQ fix这里我用了[官方推荐方法](https://dortania.github.io/Getting-Started-With-ACPI/Universal/irq.html):SSDTTime，然后选C搞定。好像会fix有关RTC的问题。
- EC补丁打上去后会黑屏，遂放弃。

最后放上[自用仓库](https://github.com/marktube/XPS9570-Hackintosh-OC)还有安装成功的图片：

![安装成功](../../../../assets/images/IMG_7106.JPG)

