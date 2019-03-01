---
layout: post-mathjax
title: "约束极值问题和拉格朗日对偶"
date: 2018-12-21 16:47
disqus: true
categories: Math
---

> 当面对某个问题不知道如何去确定开始的方向时，就千方百计地去创造一个对手，那个对手会告诉你朝哪走


#### 约束极值问题

一元函数的极值和最值问题可以通过一阶导数和二阶导数去寻找驻点并去判断，多元函数极值与最值与一元函数有很多类似的地方，但也有不同之处。如果再加上某些约束，可能会使得问题变得比较复杂。约束一般有等式约束和不等式约束，对于等式约束，按如下的方式化为不等式约束

$$
f(x_1,x_2,\cdots,x_n)=0\Leftrightarrow 
\begin{cases}
\begin{align}
f(x_1,x_2,\cdots,x_n)&\ge 0\\
-f(x_1,x_2,\cdots,x_n) &\ge 0
\end{align}
\end{cases}
$$

也可以将不等式约束化为等式约束，类似于SVM中的margin的思想

$$
f(x_1,x_2,\cdots,x_n)\ge0\Leftrightarrow f(x_1,x_2,\cdots,x_n)=x_{n+1}\quad(x_{n+1}\ge0)
$$

那么对于最大化目标函数的约束极值问题，通常可以写成如下形式

$$
\max_x f(x)\\ 
\begin{align}
s.t. \quad&g_i(x)\ge 0\\
&h_j(x)=0\\
\end{align}
$$

其中$x=(x_1,x_2,\cdots,x_n)$，$g_i(x)$为第$i$个不等式约束，$h_j(x)$为第$j$个不等式约束，$f(x)$为目标函数。同理可以推知最小化目标函数，对于实际问题，如果能够抽象成上面的形式，就能运用拉格朗日乘数法来进一步转化成无约束的极值问题。而无约束的极值问题可以用我们熟悉的梯度下降法、0.618法、共轭梯度法等一系列方法来寻找极值。对于目标函数和约束函数是凸函数的情况下，必定存在极值点。


#### 拉格朗日乘数法

对于上面的最大化约束极值问题，引入拉格朗日乘子$\lambda_1,\lambda_2,\cdots,\mu_1,\mu_2,\cdots​$分别对应不等式和等式约束，构造下面的拉格朗日函数

$$
L(x,\lambda_i,\mu_j)=f(x)+\sum_i \lambda_ig_i(x)+\sum_j\mu_jh_j(x)
$$

若令$\lambda_i\le 0​$且$\mu_j​$与$h_j(x)​$异号，可以得到$L(x,\lambda_i,\mu_j)\le f(x)​$，即可以通过构造$\lambda_i,\mu_j​$来最小化$L(x,\lambda_i,\mu_j)​$，使之成为$f(x)​$的一个下界，令这个下界为

$$
\mathcal{L}(x)=\min_{\lambda_i\le0,\mu_j}L(x,\lambda_i,\mu_j)
$$

当$x​$满足$g_i(x)=0​$和$h_j(x)=0​$的约束时，$\mathcal{L}(x)=f(x)​$，反之，$\mathcal{L}(x)=-\infty​$。所以，需要对$\mathcal{L}(x)​$取最大化，得到$f(x)​$最大值

$$
\max_x \mathcal{L}(x)=\max_{x}\min_{\lambda_i\le0,\mu_j}L(x,\lambda_i,\mu_j)
$$

这就是广义拉格朗日函数的极大极小问题。拉格朗日乘子的引入相当于在目标函数上加入了约束的条件，并通过拉格朗日乘子将其变成了一个分段函数，从这点来看拉格朗日乘数法也有了点0-1损失的味道。



#### 对偶问题

令

$$
\mathcal{D}(\lambda_i,\mu_j)=\max_{x}L(x,\lambda_i,\mu_j)
$$

这里$\mathcal{D}(\lambda_i,\mu_j)$把$x$作为了拉格朗日乘子，而将$\lambda_i,\mu_j$当成了自变量，但是在这里$\lambda_i,\mu_j$是有约束的。那么$\mathcal{D}(\lambda_i,\mu_j)$其实是$L(x, \lambda_i,\mu_j)$的一个上界。类似于上面的操作，当$\lambda_i,\mu_j$满足约束时，可以得到$\mathcal{D}(\lambda_i,\mu_j)=f(x)$，反之，$\mathcal{D}(\lambda_i,\mu_j)=+\infty$，对$\mathcal{D}(\lambda_i,\mu_j)$取最小化，得到$f(x)$最大值

$$
\min_{\lambda_i\le0,\mu_j} \mathcal{D}(x)=\min_{\lambda_i\le0,\mu_j}\max_{x}L(x,\lambda_i,\mu_j)
$$

对比上面的极大极小问题，可以看到，只是在极大极小的地方调换了位置，最后求得的值仍然是约束极值问题的最优解（如果存在的话）。



#### KKT(Karush-Kuhn-Tucker)条件

KKT条件是确定某点为最优点的必要条件，但一般来说并不是充分条件。但是对于凸规划来说，KKT条件是最优点的充要条件。KKT条件的简单描述如下：

设$x^* $是上面约束优化问题的最优解，并有对应的$\lambda_i^* ,\mu_j^* $，那么

$$
\begin{cases}
\begin{align}
\nabla_xL(x^*,\lambda_i^*,\mu_j^*)=0\\
\nabla_{\lambda_i}L(x^*,\lambda_i^*,\mu_j^*)=0\\
\nabla_{\mu_j}L(x^*,\lambda_i^*,\mu_j^*)=0\\
\lambda_i^*g_i(x^*)=0\\
\mu_j^*h_j(x^*)=0\\
\lambda_i^*\le 0\\
\mu_j^*\ne0
\end{align}
\end{cases}
$$

KKT条件的推导，其实可以看作是对函数$L(x,\lambda_i,\mu_j)​$求驻点，其中的拉格朗日乘子也作为自变量求偏导。在KKT条件下，可以总结出原始和对偶问题的一些基本性质

- 弱对偶性
  $$
  \max_{x}\min_{\lambda_i\le0,\mu_j}L(x,\lambda_i,\mu_j)\le L(x,\lambda_i,\mu_j)\le\min_{\lambda_i\le0,\mu_j}\max_{x}L(x,\lambda_i,\mu_j)
  $$

- 最优性

  若
  
  $$ \max_{x}\min_{\lambda_i\le0,\mu_j}L(x^*,\lambda_i^*,\mu_j^*)=\min_{\lambda_i\le0,\mu_j}\max_{x}L(x^*,\lambda_i^*,\mu_j^*)
  $$
  
  ，则此时$x^*,\lambda_i^* ,\mu_j^* $是最优解

- 强对偶性
  假设$f(x),g_i(x)$均为凸函数，$h_j(x)$为仿射函数，且不等式约束$g_i(x)>0$严格可行，则原问题和对偶问题均有最优解，且它们的最优解目标函数相等

- 互补松弛性

  当$g_i(x)$严格大于0时，对应的拉格朗日乘子$\lambda_i=0$.

在线性规划的特例中，最优点的条件总结成了三点：原始可行性、对偶可行性、互补松弛性，详细的会在后面线性规划问题中讨论。