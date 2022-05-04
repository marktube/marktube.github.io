---
layout: post-mathjax
title: "Dream to be a butterfly🦋（庄生晓梦迷蝴蝶）幕后"
date: 2022-05-02 20:33
disqus: true
categories: Computer Graphics
---

> 怎么也飞不出，花花的世界，原来我是一只，酒醉的蝴蝶～

<center>
<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=298 height=52 src="//music.163.com/outchain/player?type=2&id=1943643788&auto=1&height=32"></iframe>
</center>

### 起

最近投了一篇论文，恰逢五一假期，听到实验室师弟分享了[首届 Taichi 体素创意大赛](https://mp.weixin.qq.com/s/qYrsNKpRG4NiLNm4URueDw)，就来玩了（~~才不是为了免费的T恤呢~~）。然后审了一下题，开始划重点：

- 99行代码
- 三个维度体素网格范围是[-64, 63]
- 除了 **scene、taichi、taichi.math** 以外不能 import 别的包，不能使用文件 IO，也不能创建新的 field。

这就限制了很多骚操作，但是官方仍然有给出[参考博客](https://mp.weixin.qq.com/s/KzlrWKhli5OwQvw5NrzLoQ)。虽然按照这个博客思路可以创作出很多作品，但是我就喜欢搞点不一样的，哈哈哈。原文是用**MagicaCSG**的基本几何图形原型（球、圆柱、方块和棱锥）拼装成目标形状。正好我想起了之前看到过的一些有意思的函数可以画出好看的图形，包括爱心和蝴蝶，不只这些常见的规则几何图形。这也是我接下来的创作的初衷之一，另外一部分初衷则是关于我在这个春天里的遇见。I am an artist!!!

![我的作品：Dream to be a butterfly🦋(庄生晓梦迷蝴蝶)](https://github.com/marktube/voxel-challenge/raw/main/screenshot2022-05-01-160008.jpg)

### 承

之前在用MathStudio的时候，看到过教程里面的好看曲线，给我留下了深刻的印象，下面先给出上图中用到的曲线方程，第一个，蝴蝶曲线：

![butterfly curve](https://github.com/marktube/marktube.github.io/raw/master/assets/images/butterfly_curve.png)

曲线方程为：

$$
r = e^{\sin{\theta}}-2\cos{4\theta}+\sin^5{\frac{2\theta-\pi}{24}},\,\theta\in [0,21\pi]
$$

第二个，爱心曲线：

![heart curve](https://github.com/marktube/marktube.github.io/raw/master/assets/images/heart_curve.png)

曲线方程为：

$$
r = 3 - 3 \sin\theta + \frac{\sin\theta \sqrt{\lvert\cos\theta\rvert}}{\sin\theta+1.6},\,\theta\in[0,2\pi]
$$

第三个，大家都熟悉的二维高斯分布：

![gaussian2d](https://github.com/marktube/marktube.github.io/raw/master/assets/images/gaussian2d.png)

分布函数直接去看[我以前的博客](https://marktube.github.io/2017/10/12/Random-variables-and-their-distribution)吧～

然后附送一个花花的曲线：

![flower curve](https://github.com/marktube/marktube.github.io/raw/master/assets/images/flower_curve.png)

曲线方程为：

$$
r=\sin{4\theta},\,\theta\in[0,2\pi]
$$


最后送一个曲面，如果有空的话打算用它来做那种高脚酒杯的杯子部分：

![sqrt_x2_y2](https://github.com/marktube/marktube.github.io/raw/master/assets/images/sqrt_x2_y2.png)

曲面方程为：

$$
z=\sqrt{x^2+y^2}
$$

注意一下比赛中坐标系是y轴朝上哦。另外，无聊的话可以试着调整一下各个函数里面的数字，用matlab或者python画出来看看有什么不一样。

### 转

有了这些曲线或者曲面之后，我们能做什么呢？之前看过[斯坦福的图形学几何处理算法的课件](http://graphics.stanford.edu/courses/cs468-10-fall/LectureSlides/04_Surface_Reconstruction.pdf)里面介绍的隐式表达，也就是符号距离函数（SDF=Signed Distance Function）。对于一个简单的单位球面来说，这个球的方程是：

$$
x^2+y^2+z^2=1
$$

为了区分空间中任意一点是在球体内部还是外部，我们可以构造一个函数：

$$
f(x,y,z)=x^2+y^2+z^2-1
$$

当$f(x_0,y_0,z_0)<0$时这一点$(x_0,y_0,z_0)$在球的内部。为了画出这个球，可以用几个循环来遍历体素空间中的所有点，把所有点的坐标放进这个符号距离函数中，判断点是否在球内，若是则画出该方块。

有了以上的思路，只需要把上面的曲线或曲面方程转化为SDF就行，同时注意体素空间大小，可以加个包围盒，在包围盒空间中画方块。但是也需要对体素空间坐标进行缩放和位移，到SDF对应的坐标空间，然后再进行内外的判断。在画之前也可以加入位移和旋转达到对应的效果，位移可以直接加法，旋转具体可以看taichi.rotate3d函数。

有一些极坐标表示的曲线方程需要转换一下坐标系，还有就是要注意arcsin函数的值域是$[-\frac{\pi}2,\frac{\pi}2]$还要判断一下$x$的值才能确定真正的角度，但是我这里的线是关于y轴对称的，所以只用arcsin就行。

对于蝴蝶曲线来说，这是一个二维的曲线，画出二维之后我考虑再加入一个翅膀扇动的幅度，要让这个幅度更加的优雅。也就是说，在已有的XoY平面上画出蝴蝶后，在Z轴上需要再加入一些偏移来达到翅膀扇动的效果。最简单的方法就是令$z=\lvert x\rvert$，但是这种线性的并不好看。晚上的时候我偶然想起图像处理课程中的伽马变换:

![gamma transform](https://github.com/marktube/marktube.github.io/raw/master/assets/images/gamma_transform.png)

看看这曲线，脑补一下，真的很像煽动翅膀时的轨迹，如果把它用到这里简直是太合适了（~~我真的是个天才~~），只能感叹灵感如昙花一现。除此之外，我还作出了一个大胆的假设，蝴蝶翅膀扇动时的$z$坐标是与**该点到原点的距离相关**，而不仅仅只是$x$值。由此，我也终于解决了翅膀扇动的问题。

然后就是爱心曲线，为了让它更加丰满，也需要在z轴上加入一些凸起，这里我就直接采用了二维的高斯分布。这里还要多说一句，高斯分布真的很好用，均值和方差调整一下能给我们很多方便。

![heart_voxel](https://github.com/marktube/marktube.github.io/raw/master/assets/images/screenshot2022-05-04-212516.jpg)

最后就是山和云了，山顶上还加入了亿点点雪，话说回来是不是有点过于抽象了。这两个都是用的二维高斯分布画的，没想到吧哈哈哈。云彩是加入了一点点平移而已。其余部分请参考[代码仓库](https://github.com/marktube/voxel-challenge)。

### 合

最后来随意说说感想吧。数学是十分优雅和简洁的工具，艺术和数学看起来好像风马牛不相及，其实却是一衣带水，不信请看达芬奇。$128^3$看起来很大，其实也很小，所以我就直接把floor设置成大海的颜色啦。光线的设置上，“晓”的时间应该不能太亮，就把光调低了，然后为了突出蝴蝶，把蝴蝶的色块改成了光源。庄周梦蝶是大家耳熟能详的典故，所以一开始也是想围绕这个题材进行创作。加入山、海、云这些宏大的意象，然后和微小的蝴蝶放在一起，体现出一种物哀美学，“寄蜉蝣于天地，渺沧海之一粟”。远处的太阳被替换成小心心似乎提醒这是梦（~~好了，我编不下去了~~）。

最后祝大家都能在比赛中玩得开心，希望我的博客也能给大家带来一些新的思路。我的表达可能有些疏漏，仅代表个人观点，如果有问题可以继续讨论。后续如果有时间的话，考虑把山改成高斯混合模型，再给大家整个活，酒醉的蝴蝶安排上～




”若知是梦何须醒,不比真如一相会。“
