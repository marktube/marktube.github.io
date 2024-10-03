---
layout: post
title: "从线性回归到逻辑回归"
mathjax: true
disqus: true
date: 2017-04-11 15:43
categories: Machine&nbsp;Learning
---

> 万物皆数，所有问题经过适当地抽象最终会转化为数学问题。（一元）线性回归是从二维数据点中，找到一条直线来拟合以使得方差最小。逻辑回归建立了从概率到实数的映射关系。也许所有的因果正如sigmoid函数，0和1之间，有限亦无限。

### 一元线性回归

高中数学中（一元）线性回归问题是统计学中一个基本的知识点。最小二乘法和线性回归方程似乎还需要背一下。下面先回顾一下推导的过程。

假设我们拿到一组数据，里面全是二维的坐标点（x,y）的格式。很快我们能够在直角坐标系中画出这些点，如下图：
![linear_data](../../../../assets/images/figure_linear_data.png)
我们能够很直观地看到，这里的点的分布情况，像是在一条直线的周围。人们似乎很乐意去预测和提前知道某些事情的结果，在某个已经给定的前提之下。所以我们很想知道这条直线的方程，我们在此处先假设这条直线方程是$\hat y=ax+b$，为了衡量这个预测方程的拟合效果，我们定义一个损失函数:

$$Cost = \sum_{i=1}^n(y_i-\hat y_i)^2$$

可以很简单地看到，我们希望将这里的损失函数的值降到最小为0，而且还要满足另一个条件:

$$a\bar x + b = \bar y\tag{1.1}\label{1.1}$$

当然这里的$\bar x = \frac1n(x_1+x_2+\cdots+x_n)$和$\bar y = \frac1n(y_1+y_2+\cdots +y_n)$为x和y的平均数。这样一个模型就被我们描述出来了，剩下的就是用数学的方法求出直线方程里的a和b了。

将直线方程代入损失函数，重新整理可以得到下面的式子:

$$Cost=\sum_{i=1}^n(ax_i+b-y_i)^2$$

$$\Downarrow$$

$$Cost=\sum_{i=1}^n(a^2x_i^2+b^2+y_i^2+2abx_i-2ax_iy_i-2by_i)$$

$$\Downarrow$$

$$Cost=a^2\sum_{i=1}^nx_i^2+\sum_{i=1}^ny_i^2-2a\sum_{i=1}^nx_iy_i+2nab\bar x-2nb\bar y+nb^2$$

后面的三项提取公约数后得到$2nb(a\bar x+b-\bar y-\frac b2)=-nb^2$放进损失函数之后得到：

$$Cost=a^2\sum_{i=1}^nx_i^2+\sum_{i=1}^ny_i^2-2a\sum_{i=1}^nx_iy_i-nb^2$$

接下来看看还有哪里可以化简一下，注意到最后的$nb^2$项，这里有a和b两个参数需要求，不如直接利用$\eqref{1.1}$的条件，将此项消去:

$$Cost=a^2\sum_{i=1}^nx_i^2+\sum_{i=1}^ny_i^2-2a\sum_{i=1}^nx_iy_i-n(\bar y - a\bar x)^2$$

$$\Downarrow$$

$$Cost=a^2\sum_{i=1}^n(x_i^2-\bar x^2)-2a\sum_{i=1}^n(x_iy_i-\bar x\bar y)+\sum_{i=1}^n(y_i^2-\bar y^2)\tag{1.2}\label{1.2}$$

从式$\eqref{1.2}$基本上已经能够看出求解a的方法了，将此处的损失函数看成是关于参数a的函数，那么在这个一元二次函数的最小值点为:

$$a=\frac{\sum^n(x_iy_i-\bar x\bar y)}{\sum^n(x_i^2-\bar x^2)}=\frac{\sum^n(x_i-\bar x)(y_i-\bar y)}{\sum^n(x_i-\bar x)^2}$$

当a被计算出来时，b也可以利用式1.1得到。值得注意的是a的分母项除以n是x的方差，分子除以n是协方差。下图是通过最小二乘得到的拟合直线：
![linear_regression_line](../../../../assets/images/figure_least_square.png)

### 多元线性回归
上面就是最小二乘法的推导，但是我们经常见到的是更多的参数，不只有x和y，而是一个vector。为了将线性回归加以推广，我们需要重新看一下我们的数据。首先将二维的数据推广到更高维度，假设我们对于某个值y的估计提取到了k个数字特征$x_1,...,x_k$，那么为了找到一个线性的关系，我们先假设这个线性的关系如下:

$$\hat y=a_0 + a_1x_1 + a_2x_2 + \cdots +a_kx_k$$

同样地，我们的损失函数定义为:

$$Cost = \frac12 \sum_{i=1}^n(\hat y_i - y_i)^2$$

这里的损失函数似乎比上面的多了个1/2，这里提前说明一下，这个1/2是为了消去二次项求导时的系数2。而0到n是已有的统计数据的编号。

相比一元的线性回归，似乎损失函数带来的计算量增长了不少，而且多元函数的计算和化简相比之下复杂的多。不妨从数学角度重新看看这个问题。我们确定了y和向量x的线性关系，同时需要求损失函数最小时，线性方程中参数的值。那么依然用一元的方法，将线性的关系代入损失函数，再进行具体分析:

$$Cost = \frac12 \sum_{i=1}^n(a_0 + a_1x_1 + a_2x_2 + \cdots +a_kx_k-y_i)^2$$

如果还是像之前那样，利用代数技巧做出展开和化简，我们会发现，我们缺少多个类似于式1.1的条件将整个代价函数化简成关于a的一元函数。所以我们只能将损失函数当作关于$a_0,...,a_k$的多元函数来考虑。对于这种无约束极值问题，我们首先会想到最快下降的方法——梯度下降。

### 梯度下降

对于损失函数这样的多元函数，我们可以采取另一种取巧的方法来找参数$a_0,...,a_k$。我们想要损失函数变小，那么根据微分的相关知识，先对其求微分：

$$
\Delta C= \frac{\partial C}{\partial a_0}\cdot\Delta a_0 + \frac{\partial C}{\partial a_1}\cdot\Delta a_1 + \cdots + \frac{\partial C}{\partial a_k}\cdot\Delta a_k
$$

为简单起见Cost写成C。我们希望$\Delta C$能够小于0，这样每次按照某种规则改变$a_0,a_1,\cdots,a_n$就能够一直减小损失函数的值，不断地迭代直到损失函数为0。所以我们取

$$
\Delta a_0=-\lambda \frac{\partial C}{\partial a_0},
\Delta a_1=-\lambda \frac{\partial C}{\partial a_1},
\cdots,
\Delta a_k=-\lambda \frac{\partial C}{\partial a_k}
$$

其中$\lambda>0$为学习率，这样$\Delta C$就会一直小于零，一次次地减小损失函数，同时使损失函数趋近于0。整个过程就如同一个铅球从山顶滚向谷底，而球每次滚动的方向就是梯度下降的方向。
![linear_data](../../../../assets/images/figure_gradient.png)梯度(Gradient)即是某点所有偏导数构成的向量:

$$
\nabla C = (\frac{\partial C}{\partial a_0},\frac{\partial C}{\partial a_1},\cdots,\frac{\partial C}{\partial a_k})
$$

需要注意的是，梯度下降法会受到初始值的影响导致最终收敛于不同的局部最小值。但是值得庆幸的是，在这里的线性回归模型中，代价函数是一个凸函数，所以不会出现这样的结果。同时对于正定的二次函数来说，牛顿法也是很好的一种选择。

我们可以先计算一下上面损失函数关于参数$a_1$的偏导:

$$
\frac{\partial C}{\partial a_1}=\sum_{i=1}^n{x_1(a_0+a_1x_1+\cdots+a_kx_k-y_i)}
$$

当样本数量比较多时，我们会发现这个求和运算会使得计算量增大，所以不如换一种方式进行计算，将求和去掉，每次只用少量的样本去计算偏导进行更新。这样我们需要将原来的样本分成很多批，每批都是一个固定的数量，或者更简单地，我们每次只使用一个样本去求梯度。这种被称为随机梯度下降(Stochastic Gradient Descent)。

### 牛顿法

对于多元线性回归的损失函数，把它看成是关于参数$a_0,\cdots,a_n$的二次型，忽略最理想的情况0，该二次型是正定的。所以，我们可以运用牛顿法来求出该函数的极小值点。这里参考Andrew Ng在机器学习课程中的推导方法，首先定义一些操作和符号。

- 矩阵的迹:一个方阵的对角元素之和
$$
trA=\sum_{i=1}^nA_{ii}
$$

- 定义一个矩阵到函数的映射$\mathbb R^{m*n} \Rightarrow \mathbb R$为$f(A)$则函数关于矩阵$A$的梯度为:

$$
\nabla f_A=
\begin{bmatrix}
     \frac{\partial f}{\partial a_{11}}  & \frac{\partial f}{\partial a_{12}} & \cdots & \frac{\partial f}{\partial a_{1n}} \\
     \frac{\partial f}{\partial a_{21}}  & \frac{\partial f}{\partial a_{22}} & \cdots & \frac{\partial f}{\partial a_{2n}} \\
     \vdots  & \vdots & \ddots & \vdots \\
     \frac{\partial f}{\partial a_{n1}}  & \frac{\partial f}{\partial a_{n2}} & \cdots & \frac{\partial f}{\partial a_{nn}}    
\end{bmatrix}
$$

- 迹的性质:

$$tr(AB)=tr(BA)$$

$$tr(ABC)=tr(CAB)=tr(BAC)$$

$$tr(A^{\mathrm T})=tr(A)$$

$$\nabla_A tr(AB)=B^{\mathrm T}$$

$$\nabla_A tr(ABA^{\mathrm T}C)=CAB+C^{\mathrm T}AB$$

那么将损失函数写为矩阵的表示如下:

$$
Cost=\frac12(XA-Y)^{\mathrm T}(XA-Y)
$$

其中$A=[a_0,a_1,\cdots,a_n]$，$X$是所有的特征样本排列的矩阵，$Y=[y_1,y_2,\cdots,y_n]$。对于一个实数来说，它的迹为它本身。因为损失函数的值本身就是一个实数，我们可以稍微改写下关于A的梯度:

$$
\nabla_A C=\nabla_A tr(C)=\frac12\nabla_Atr\left ((XA-Y)^{\mathrm T}(XA-Y)\right )
$$

$$\Downarrow$$

$$
\nabla_A C = \frac12\left [\nabla_Atr(A^{\mathrm T}X^{\mathrm T}XA)-\nabla_Atr(A^{\mathrm T}X^{\mathrm T}Y)-\nabla_Atr(Y^{\mathrm T}XA) \right ]
$$

$$\Downarrow$$

$$
\nabla_A C =X^{\mathrm T}XA-X^{\mathrm T}Y
$$

最后我们令$\nabla_A C=0$可以得到:

$$
A=(X^{\mathrm T}X)^{-1}X^{\mathrm T}Y
$$

### ~~逻辑回归~~(对数几率回归)

逻辑回归最早起源于人口统计数据的分析。作为Logistic Regression的音译，这个翻译并未传达出本来的意思，跟逻辑没什么直接的联系，西瓜书里甚至直接将它称为**对数几率回归**。Logistic回归命名的主要原因是数据服从Logistic函数的分布。[这个函数是维尔赫斯特在对人口增长数据分析时提出来的](https://zhuanlan.zhihu.com/p/146206709)，接下来我们试着从维尔赫斯特的角度出发推导出这个函数。

#### 逻辑斯蒂函数(Logistic Function)

假如在一个资源丰富，气候适宜的小岛上，人口随时间变化的函数为$P(t)$，而人口增长率为该函数的导数:

$$
P^{\prime}(t)=\frac{\mathrm{d}P}{\mathrm{d}t}
$$

，没有任何限制的情况下，人口增长率和当前人口总数成正比，即：

$$
P^{\prime}(t)=\alpha P(t)
$$

，假设这里参数$\alpha$为比例系数。通过微分方程求解可以很简单地得到人口随时间增长的函数表达式为

$$
P(t)=P(0)e^{\alpha t}
$$

，这里$P(0)$是初始人口数。但是由于资源和空间的限制、人口死亡和疾病等因素影响，实际人口数量会在指数级增长后趋于平稳。将这个人口增长率变化的过程简单总结一下就是：**先开始增长率慢慢增加，达到一个峰值后逐渐下降，最后趋近于零**。根据这样的特性，增长率$P^{\prime}(t)$用一个关于$P(t)$的二次函数来描述，可以推导出最后的Logistic函数，如下图：

![quad_plt](../../../../assets/images/quad_curve.png)

二者关系可以用如下的微分方程描述：

$$
P^\prime(t)=\alpha P(t)[B-P(t)]
$$

，其中$B$是该小岛能容纳的人口上限。将$P(t)$进行归一化处理，即这里$P(t)$转化为该小岛当前$t$时刻实际容纳人口占容纳上限的比例，可以将$B$的影响先消去，可以得到：

$$
P^\prime(t)=\alpha P(t)[1-P(t)]\\
\Downarrow\\
\frac{\mathrm{d}P}{\mathrm{d}t}=\alpha P(1-P)
$$

接下来求解这个微分方程：

$$
\frac{\mathrm{d}P}{P(1-P)}=\alpha\mathrm{d}t\\
\Downarrow\\
\int \frac{\mathrm{d}P}{P(1-P)}=\int \alpha\mathrm{d}t\\
\Downarrow\\
\ln(\frac{P}{1-P})=\alpha t+C\\
\Downarrow\\
\frac{1}{P}-1=e^{-(\alpha t+C)}\\
\Downarrow\\
P=\frac{1}{1+e^{-(\alpha t+C)}}
$$

。这个函数被称为逻辑斯蒂函数(logistic function)，为了表达出该函数更确切的含义，后面将翻译为对数几率函数。我们把这个函数画出来看看是什么样子，这里直接画出了$\alpha=1,C=0$的情况，也就是深度学习中常用的激活函数Sigmoid:

![logistic_func](../../../../assets/images/logistic_func.png)

可以看到，这个人口增长的曲线还是很符合之前对人口增长率趋势的总结。接下来看看$\alpha$和$C$两个参数对它的影响，见下图：

![logistic_params](../../../../assets/images/logistic_params.png)

可以看到，$\alpha$越大越接近阶跃函数，$\alpha$越小越平缓，而$C$主要是控制水平方向上的位移。这个函数还有一些其它很好的性质，它的定义域是$(-\infty,+\infty)$，单调递增，高阶可微。

#### 回归or分类？

接下来我们回到对数几率回归问题。对数几率回归其实是用这个对数几率函数将输入映射到二分类的概率上，然后根据这个概率设置一个阈值来进行**分类**。对于简单的二分类问题，给定输入$X\in \mathbb{R}^n$，为输出$1$的概率为：

$$
p=\frac{1}{1+e^{-(\mathbf{w}^TX+b)}}
$$

，其中$\mathbf{w}\in\mathbb{R}^n, b \in \mathbb{R}$为对数几率回归的参数，那么输出$0$的概率为$1-p$，这二者的比值被称为**几率(odds)**：

$$
\frac{p}{1-p}
$$

那么将几率取对数就得到了**对数几率(log odds, logit)**：

$$
\ln\frac{p}{1-p}
$$

把上面$p$的函数代入到对数几率函数中可以得到：

$$
\ln \frac{p}{1-p} = \ln(e^{\mathbf{w}^TX+b})=\mathbf{w}^TX+b
$$

。我们惊讶地发现，这就是上文中的高维线性表达！本质上这个模型就是在线性模型的基础上增加了Sigmoid作为激活函数。

剩下的就是求取参数$\mathbf{w},b$，对于给定的训练集，因为样本概率是可计算的，可以直接采用最大似然法来对参数进行估计。对于训练集中带标签$y\in\{0,1\}$的单个样本，我们有：

$$
p(y\vert X)=\frac{y}{1+e^{-(\mathbf{w}^TX+b)}}+\frac{1-y}{1+e^{\mathbf{w}^TX+b}}
$$

假设对输入X的采样是独立且均匀的，那么$p(X)$其实是一个常数，可以在优化项中省去，为了使$\prod_i p(X_i,y_i)=\prod_i p(X_i)p(y_i\vert X_i)$最大，这里可以直接近似计算$\prod_i p(y_i\vert X_i)$，为方便计算取对数似然后可以得到：

$$
\max_{\mathbf{w},b}\sum_i-y_i\ln(1+e^{-(\mathbf{w}^TX+b)})+(y_i-1)\ln(1+e^{\mathbf{w}^TX+b})
$$

，该函数是凸的，最后通过优化器求解即可得到参数，用于后续相关预测任务。
