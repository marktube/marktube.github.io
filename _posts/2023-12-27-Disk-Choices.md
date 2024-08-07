---
layout: post
title: 自助数据恢复记录
date: 2023-12-28 10:03:00
disqus: true
categories: Computer
---

>收废品啦，硬盘一斤5毛o((⊙﹏⊙))o

### 归因

最近水逆，好像说会影响电子产品。好巧不巧，我的移动硬盘g了。俺的移动硬盘是19年购买的希捷2T机械硬盘，主要四个分区：EFI分区、128G的Ubuntu、128G的黑苹果和1.6T的NTFS数据分区。前段时间因为装黑苹果导致对硬盘有长时间的读写，然后最近几天在拷贝文件时突然断电导致现在插上硬盘就提示我格式化，信你个鬼，我斩钉截铁地点击了取消（要是真格式化了，数据就全都没了）。

![format](../../../../assets/images/disk_format.jpg)

我突然意识到了问题的严重性，硬盘坏没坏不重要，数据没了才是真的糟心！冷静一下之后，我开始分析损坏原因和寻找恢复数据的方法。先拿CHKDSK命令试一下，结果如下：

![chkdsk](../../../../assets/images/disk_chkdsk.jpg)

看来只有拿出[DiskGenius](https://www.diskgenius.cn/)来试试看了，先用[恢复文件功能](https://www.diskgenius.cn/exp/use-tutorial.php)试试，结果恢复到一会提示我扇区损坏无法读取！！！又试了坏道检测和修复，果然出现了坏道，但是不能直接修复，那样的话会损坏原有数据。于是决定使用[扇区复制功能](https://www.diskgenius.cn/exp/disk-bad-sector-data-recovery.php)来找回原有数据，所以才有了购买硬盘的需求。

这里还是总结一下机械硬盘使用的一些注意事项，防止后面翻车：
1. 硬盘读写过程中不要断电，不要断开连接线拔掉硬盘
2. 尽量不要挪动硬盘防止受到震动
3. 硬盘需要远离磁场
4. 硬盘使用完毕后在电脑中选择安全弹出
5. 移动硬盘不要长时间看视频或玩游戏，每日工作时间不超过8小时
6. 尽量定期检查一下硬盘情况，出现坏道及时备份，尤其过保后的移动硬盘
7. 一些非隐私数据，可以考虑云盘服务

另外有些时候USB接口可能会因为省电模式管理而在使用一段时间后停止供电，可以在**设备管理器-通用串行总线控制器-USB根集线器-属性-电源管理**中，取消勾选“允许计算机关闭此设备以节约电源(A)”。

### 选购

说到买硬盘，这里面水可深了，一般人很难把握。刷漆贴标、以次充好、库存翻新、大削成本、广告洗脑、矿场锻炼都是常见操作。目前普通消费者选择除了机械硬盘就是固态硬盘，希捷(Segate)、西数(Western Digital)、东芝(Toshiba)、三星(Samsung)占据了大部分市场。先主要总结一下机械和固态的区别和各自优缺点：

| 指标 |          机械硬盘          |         固态硬盘         |
| ---- | :------------------------: | :----------------------: |
| 介质 |             磁道           |           闪存颗粒       |
| 速度 |         最高200M/s         |      最高3500~8000M/s    |
| 电压 |       2.5寸5V/3.5寸12V     |        3.3V/5V/12V       |
| 电流 |            2A/3A           |          1A/2A/3A        |
| 规格 |         2.5寸/3.5寸        |     2230/2242/2260/2280  |
| 接口 |          SATA/IDE          |        SATA/M.2/u.2      |
| 时长 | 取决于磁头磁道等的机械强度 | 取决于固态颗粒的电磁特性 |
| 容量 |          512G~20T          |          256G~4T         |
| 价格 |         约100￥/T          |         约400￥/T        |

机械硬盘与固态硬盘的主要区别在于，机械硬盘有机械结构，而固态硬盘则是使用闪存颗粒制作而成。因此，固态硬盘在防震抗摔性、数据存储速度、功耗、重量、噪音等方面都优于机械硬盘。
然而，机械硬盘在数据恢复方面有优势。如果硬盘内部的数据非常重要，例如对于企业或重要岗位的电脑，机械硬盘可能是更好的选择。此外，尽管机械硬盘存在老化现象，但只要不是高强度运行下，普通消费者的机械硬盘保养得当，基本都能达到7-10年以上的寿命。

因为机械和固态各自的特性，用户主要根据自身读写的需求来选择。一般来说，读写比较多，要求速度快的用户选择固态，而对读写速度没有特别高，想要更大容量的用户选择机械。当然还有一些用多块机械硬盘组RAID的玩家，这部分对普通消费者来说可能有一些门槛。


#### 机械硬盘

机械硬盘很早就出现了，也被称为传统普通硬盘，作为计算机中容量最大的存储介质，主要由以下几个部分组成：

- 盘片
- 磁头
- 盘片转轴及控制电机
- 磁头控制器
- 数据转换器
- 接口
- 缓存

![hdd](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Laptop-hard-drive-exposed.jpg/440px-Laptop-hard-drive-exposed.jpg)

磁头可以沿着盘片的半径方向运动，加上盘片每分钟几千转的高速旋转，磁头就可以定位在盘片的指定位置上进行数据的读写操作。信息通过离磁性表面很近的磁头，由电磁流来改变极性方式被电磁流写到磁盘上，信息可以通过相反的方式读取。机械硬盘的读写速度依赖于电机的转速，因为需要依靠电机带动磁盘高速转动使磁头找到指定位置进行读写。

目前机械硬盘比较大的雷点在于叠瓦盘(SMR)。SMR(Shingled Magnetic Recording)和CMR(Conventional Magnetic Recording)都属于PMR(Perpendicular Magnetic Recording)。为了节省空间成本，资本家们在同样的空间内让磁道有重叠的排放，就像屋顶的瓦片一样，这样会在同样的空间内装下更多的数据，但是会使得写入数据时相邻磁道之间会有一定影响。资本家不会为了这点影响跟利益过不去，但是消费者为了自己的数据稳定，还是不要选择这样的产品。

![smr](../../../../assets/images/disk_intro-smr-zones.png)

目前来说移动机械硬盘领域是叠瓦盘的重灾区，因为移动硬盘的用户需求是硬盘的便携性和大容量。目前大多数移动硬盘都是2.5寸盘，要在这么小的空间内放下1T~2T的数据，目前只有叠瓦盘（固态除外）。所以买移动硬盘最好选择固态，价格更高但是速度、体积和防摔性能更好。另外，看缓存区分SMR和CMR也不一定准确，参考[b站视频](https://www.bilibili.com/video/BV15V4y1J7QW/)

买到硬盘后，可以参考[贴吧教程](https://tieba.baidu.com/p/8653604476)进行验货。
下面列出一些常用的**测试软件**：[HD_tune](https://www.hdtune.com/index.html)、[DiskGenius](https://www.diskgenius.cn/)、[Victoria](https://hdd.by/Victoria/)、[CrystalDiskInfo](https://crystalmark.info/ja/software/crystaldiskinfo/)。可以在机械硬盘吧中找到一些资源分享，以及使用教程，此处不再赘述。

**硬盘盒**：为了能将硬盘方便地携带，且通过电源和USB转接线连接电脑进行数据读写操作而出现的产品，有些还兼顾了散热功能。选购时主要注意电源、主控芯片、散热模块，一些常见品牌的测评可以去贴吧查找，下面给出一些参考帖子和视频：

- [阿卡西斯](https://tieba.baidu.com/p/7811784850?pn=1)
- [toolfree](https://tieba.baidu.com/p/8152387971?pid=146164226786&cid=0#146164226786)
- [诚和德](https://tieba.baidu.com/p/8573924251?pn=2#)
- [绿联&toolfree](https://tieba.baidu.com/p/8089988694?pid=145822428350&cid=0#)
- [选购注意](https://www.bilibili.com/video/BV1MS4y1C781/?spm_id_from=333.999.0.0)

一些价格太高的品牌可能不是面向普通消费级的用户，更多的是组装硬盘阵列和NAS的。

#### 固态硬盘

计算机体系结构课程中，我们学过寄存器(Register)、缓存(Cache)、内存(Memory)、机械硬盘(Hard Disk)的容量依次增大，但是存取速度依次递减。闪存（Flash）作为存取速度介于内存和机械硬盘之间的一种存储介质，断电也能保持原有数据。早期用于数码相机、MP3、U盘的存储，随着技术的发展，容量越来越大，功耗逐渐降低、成本也逐渐下降，于是也被用于制作硬盘，也就是固态硬盘SSD(Solid State Disk)。

![flash](../../../../assets/images/disk_flash.jpg)

固态硬盘主要由主控、缓存、闪存三部分构成，接口既有兼容机械硬盘的SATA，也有笔记本常用的M.2。因为闪存具有擦写次数限制的问题，闪存颗粒的质量直接关系到固态硬盘的寿命。从生产成本、读写速度、使用寿命上来说，都是SLC>MLC>TLC>QLC。SLC现在据说已经停产了，MLC主要面向中高端用户，消费级用户常见选择就只有TLC和QLC了。从接口来看SATA3和M.2都有，但是读写速度区别比较大，SATA接口的速度一般最大也就几百M每秒，而M.2接口速度可以达到几千M每秒。

AS SSD Benchmark是常用的SSD测试软件，可以用来测试固态硬盘的读写速度，建议验货时顺手测试一下。

近年来，由于国产闪存颗粒产能增加，固态硬盘的价格也逐渐降低了。存储介质选择本来就是在价格和性能上的权衡。自配台式通常还是选择系统盘固态加资源盘机械的组合。目前来说移动固态硬盘领域，USB3.0的协议和接口限制了固态的读写速度，购买时可以选择更低速的固态。也正是因此，机械硬盘在如今市场仍然有一定的地位。


### 恢复
因为硬盘存在坏道，首先利用[扇区复制](https://diskgenius.cn/help/copy-sectors.php)的功能将所有扇区复制到另外的一个硬盘(注意空间要比损坏的硬盘分区要大)，然后使用[恢复文件](https://diskgenius.cn/help/TypeRecovery.php)功能将可以识别出的文件恢复出来。如果可以的话，希望永远用不到这个部分。

![sector](../../../../assets/images/disk_sector_copy.jpg)
扇区复制设置参数时分别选择来源磁盘和目标磁盘，常规选择是遇到坏扇区跳过128个扇区，勾选正常扇区复制完成后尝试复制坏扇区，同时勾选用字符串填充坏扇区。在右上角的参数设置中可以选择起始扇区，一般来说默认源磁盘和目标磁盘的起始扇区都是0。但是我在开始复制过程中，源磁盘每隔一段时间会断电，需要重新插拔usb连接线，此时千万不要再修改界面上的任何参数，点击继续就可以继续复制了。我中间一次突然手欠，乱点了来源磁盘，然后就丢失了之前的恢复记录。这里再给出一个补救的方法，扇区复制时会有记录，每2分钟更新一次，在每次掉电或者暂停时会弹出扇区复制报告txt文件，只要按照当前尚未复制的扇区数填写到参数设置里就可以继续之前的进度了。扇区复制的这个过程比较缓慢，建议耐心等待。

最后就是恢复文件部分了，直接使用DG的文件恢复功能。在已识别的部分把所有文件拷出来就行，有些已删除的文件可以根据需要自行决定是否需要恢复。好在我的硬盘里的照片和一些最重要的文档数据没有丢失，希望大家遇到硬盘故障时都能恢复出想要的数据，尽量做好备份。

最后就是对旧硬盘的修复了。首先查看S.M.A.R.T信息，用CrystalInfo、HD tune或者Diskgenius都可以，注意05、C4、C5的值，有异常则说明出现坏道了。有的厂商会在原有硬盘容量上增加一些用来替换坏道，并维护了两个表来记录和屏蔽这些，就是P表(Permanent List)和G表(Growth List)。但是要修改和编辑这两个表涉及到底层的操作，需要一些专业的软件操作，一般来说希捷用STComTools，西数用WD Repair Tool，日立用Victoria里的HGST专修。，PC3000软件很贵，而且有些硬盘并不支持这些操作，难度较大。可以试着用Victoria对硬盘进行扫描，第一遍先选erase（修复逻辑错误），第二遍再选remap。这里的remap就是加G表的操作，如果remap失败的话，可以看看[官方说明](https://hdd.by/victoria_faq/)，如果还是不行，就说明没有效果了。但是可以试着用diskgenius把坏道位置扫描出来，然后划分分区，把坏道隔离开不用。但是此法仍然有风险，重要数据还是不要存放在有坏道的盘里。

最后还是总结一下：没有可以永恒的存储介质。《三体》里说把字刻在石头上，最古老的方式也是保存信息最久的方式。江河千里，尽入大海；人生百年，终归尘土。如果一切都有期限，那么在期限到来前，请做好准备勇敢应对。
