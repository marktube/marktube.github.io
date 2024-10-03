---
layout: post
title: "第一型曲面积分与第二型曲面积分"
date: 2018-01-31 20:55
mathjax: true
disqus: true
categories: Math
---

> 2018年1月31日，月全食，同时位于月球椭圆轨道近地点，152年一遇的超级蓝血月。椭圆曲线和和天文计算，日月星辰轨道与周期，数学的魅力就隐藏在其中。 

一个三元函数在一个曲面上的积分，称之为曲面积分。曲面的质量、重心、转动惯量等计算问题导致了第一型曲面积分等概念。

#### 第一型曲面积分

- 定义

设$\Sigma$为分片光滑曲面，$f(x,y,z)$为定义在$\Sigma$上的有界函数，$f(x,y,z)$在$\Sigma$上对面积的积分为

$$
\underset{\Sigma}\iint f(x,y,z)\mathrm{d}S\overset{\Delta}{=}\lim_{\lambda \to 0}\sum_{i=1}^{n}f(\xi_i,\eta_i,\zeta_i)\Delta S_i
$$

其中$\Delta S_i$为第$i$个小曲面块的面积。如果$f(x,y,z)$在$\Sigma$上连续，则$\underset{\Sigma}\iint f(x,y,z)\mathrm{d}S$存在。

- 性质

与曲面$\Sigma$的侧的选取无关，即$\underset{\Sigma}\iint f(x,y,z)\mathrm{d}S=\underset{-\Sigma}\iint f(x,y,z)\mathrm{d}S$，其中$-\Sigma$表示曲面$\Sigma$的另外一侧。

- 计算
  - 方法1 直接法
  
  设积分曲面$\Sigma$由方程$z=z(x,y)$给出，$\Sigma$在$xOy$面上的投影域为$D$，函数$z=z(x,y)$在$D$上有连续的一阶偏导数，$f(x,y,z)$在$\Sigma$上连续，则
  
  $$
  \underset{\Sigma}\iint f(x,y,z)\mathrm{d}S=\underset{D}\iint f(x,y,z(x,y))\sqrt{1+(z_x^\prime)^2+(z_y^\prime)^2}\mathrm{d}x{d}y
  $$
  
  - 方法2 利用奇偶性和对称性
  
  利用积分曲面的对称型和被积函数的奇偶性化简，同时可以考虑利用变量的对称性，对调变量去化简。
  
#### 第二型曲面积分

- 定义

设$\Sigma$为光滑有向曲面，$P(x,y,z),Q(x,y,z),R(x,y,z)$在$\Sigma$上有界，则

$$
\underset{\Sigma}\iint P\mathrm{d}y\mathrm{d}z+Q\mathrm{d}z\mathrm{d}x+R\mathrm{d}x\mathrm{d}y\overset{\Delta}{=}\\ \lim_{\lambda \to 0}\sum_{i=1}^{n}[P(\xi_i,\eta_i,\zeta_i)(\Delta S_i)_{yz}+Q(\xi_i,\eta_i,\zeta_i)(\Delta S_i)_{zx}+R(\xi_i,\eta_i,\zeta_i)(\Delta S_i)_{xy}]
$$

其中$(\Delta S_i)_{yz}$表示有向曲面块$\Delta S_i$在yOz坐标面上的投影。另外两个类似。如果P,Q,R在$\Sigma$上连续，则$\underset{\Sigma}\iint P\mathrm{d}y\mathrm{d}z+Q\mathrm{d}z\mathrm{d}x+R\mathrm{d}x\mathrm{d}y$存在。


- 性质

积分与曲面的侧有关，即

$$
\underset{\Sigma}\iint P\mathrm{d}y\mathrm{d}z+Q\mathrm{d}z\mathrm{d}x+R\mathrm{d}x\mathrm{d}y=-\underset{-\Sigma}\iint P\mathrm{d}y\mathrm{d}z+Q\mathrm{d}z\mathrm{d}x+R\mathrm{d}x\mathrm{d}y
$$

其中$-\Sigma$表示曲面$\Sigma$的另外一侧。

- 两类面积分的联系

$$
\underset{\Sigma}\iint P\mathrm{d}y\mathrm{d}z+Q\mathrm{d}z\mathrm{d}x+R\mathrm{d}x\mathrm{d}y = \underset{\Sigma}\iint (P\cos\alpha+Q\cos\beta+R\cos\lambda) \mathrm{d}S
$$

其中$\cos\alpha,\cos\beta,\cos\lambda$为曲面$\Sigma$上的点在指定侧的法线向量的方向余弦。


- 计算
  - 方法1 直接法
  
  设有向曲面$\Sigma:x=(y,z),(y,z) \in D_{yz}$，则
  
  $$
  \underset{\Sigma}\iint P(x,y,z)\mathrm{d}y\mathrm{d}z=\pm\underset{D_{yz}}\iint P(x(y,z),y,z)\mathrm{d}y\mathrm{d}z
  $$
  
  若有向曲面$\Sigma$的法向量与$x$轴正向的夹角为锐角，即右侧，上式取"+"号，否则取"-"号。另外两个曲面同理。
  
  - 方法2 高斯公式
  
  设空间闭区域$\Omega$是由分片光滑的闭曲面$\Sigma$所围，函数$P(x,y,z),Q(x,y,z),R(x,y,z)$在$\Omega$上有连续一阶偏导数，闭曲面$\Sigma$取外侧，则
  
  $$
  \underset{\Sigma}\iint P\mathrm{d}y\mathrm{d}z+Q\mathrm{d}z\mathrm{d}x+R\mathrm{d}x\mathrm{d}y=\underset{\Omega}\iiint(\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z})dv
  $$
  
  - 方法3 补面用高斯公式
  
  若要计算的面积分的积分曲面$\Sigma$不封闭，且用直接法不方便，此时可以补一块曲面$\Sigma_1$，使原曲面变为封闭曲面，则
  
  $$
  \underset{\Sigma}\iint=\underset{\Sigma+\Sigma_1}\iint-\underset{\Sigma_1}\iint
  $$
  
  等式右端的第一项如果满足高斯公式，则可用高斯公式计算。
  
#### 两种面积分的转化与联系

我们知道对于向量$\overrightarrow{a},\overrightarrow{b}$围成的平行四边形面积的数值为$\overrightarrow{a} \times \overrightarrow{b}$，假如给面积一个方向，那么面积也可以是一种向量，其方向垂直于该平面。那么回过来重新考虑第二型曲面积分，对于微分$\mathrm{d}S$，将其视作一个向量，则其方向即为该点的法向量，设其方向余弦为$\cos\alpha,\cos\beta,\cos\lambda$。若将该面积向量沿着$x,y,z$三轴的方向分解，即是向$yOz,xOz,xOy$平面进行投影，即可得到

$$
\underset{S}\iint \mathbf{F}\mathrm{d}\overrightarrow{S} = \underset{S}\iint (\mathbf{F}_x\mathrm{d}y\mathrm{d}z+\mathbf{F}_y\mathrm{d}x\mathrm{d}z+\mathbf{F}_z\mathrm{d}x\mathrm{d}y)
$$

其中$\mathbf{F}$为被积函数的向量形式，加下标的是按照$x,y,z$三轴的方向分解的分量。若要将左边的积分化成第一型曲面积分，只需$\mathbf{F}$的方向与$\mathrm{d}\overrightarrow{S}$方向一致，由此即可得到

$$
\underset{S}\iint F\mathrm{d}S = \underset{S}\iint (F\cos\alpha \mathrm{d}y\mathrm{d}z+F\cos\beta \mathrm{d}z\mathrm{d}x+F\cos\lambda \mathrm{d}x\mathrm{d}y)
$$


