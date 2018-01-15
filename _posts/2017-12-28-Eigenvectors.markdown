---
layout: post-mathjax
title: "特征值、特征向量和相似矩阵"
date: 2017-12-28 9:05
disqus: true
categories: Math
---

> 矩阵特征值和特征向量的概念与性质，相似矩阵的概念和性质，及相似对角化的充分必要条件

#### 特征值，特征向量(eigenvalue,eigenvector)
$A$是$n$阶方阵，如果对于数$\lambda$，存在非零向量$\alpha$，使得
$$
A\alpha=\lambda\alpha (\alpha\ne 0)
$$
成立，则称$\lambda$是$A$的特征值，$\alpha$是$A$对应于$\lambda$的特征向量。
> 可以把矩阵想象成一阵风，这股不可见的力产生了可见的变化效果。而风必定会吹向一个特定的方向。本征向量指出了矩阵这股“风”的方向。
![img1](https://deeplearning4j.org/img/mona_lisa_eigenvector.png)
[来源](https://deeplearning4j.org/cn/eigenvector)（供图：维基百科）

#### 特征方程、特征多项式、特征矩阵
根据特征值和特征向量的定义，可以得到$(\lambda E-A)\alpha=0$，因$\alpha\ne0$，故有

$$
\left| \lambda E - A \right|=
\left|
\begin{array}{}
\lambda-a_{11} & -a_{12} & \cdots & -a_{1n} \\
a_{21} & \lambda-a_{22} & \cdots & -a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
-a_{n1} & -a_{n2} & \cdots & \lambda-a_{nn} 
\end{array}
\right|
=0 \tag{1.1}
$$

上式称为矩阵$A$的特征方程，是未知元素$\lambda$的$n$次方程，在复数域内有$n$个根，左边的多项式称为$A$的特征多项式，矩阵$\lambda E-A$称为特征矩阵。

#### 特征矩阵的性质
设$A=[a_{ij}]_{n \times n}, \lambda_i(i=1,2,\cdots,n)$是$A$的特征值，则有

$$
\sum_{i=1}^n \lambda_i=\mathrm{tr}A=\sum_{i=1}^na_{ii} \tag{2.1}
$$

$$
\prod_{i=1}^n\lambda_i=\left| A \right| \tag{2.2}
$$

结合这两个性质和1.1可以求得矩阵的特征值。

#### 相似矩阵、矩阵的相似对角化
设$A,B$都是$n$阶矩阵，若存在可逆矩阵$P$，使得$P^{-1}AP=B$，则称$A$相似于$B$，记成$A \sim B$, 若$A \sim \Lambda$，其中$\Lambda$是对角阵，则称$A$可相似对角化，$\Lambda$是$A$的相似标准形。

对于有的矩阵，相似对角化是可行的，但是对于有些矩阵，并不能相似对角化，最主要的限制在于矩阵$P$必须是可逆的。结合特征向量和特征值的关系，我们假设$A=[a_{ij}]_{n \times n}, \lambda_i(i=1,2,\cdots,n),\alpha_i(i=1,2,\cdots,n)$是$A$的特征值和对应的特征向量。那么有

$$
A
\begin{bmatrix}
\alpha_1 & \alpha_2 & {\cdots} & \alpha_n
\end{bmatrix}=
\begin{bmatrix}
\alpha_1 & \alpha_2 & {\cdots} & \alpha_n
\end{bmatrix}
\begin{bmatrix}
\lambda_1 & & & \\
& \lambda_2 & & \\
& & \ddots & \\
& & & \lambda_n
\end{bmatrix}
$$

若矩阵$P=\begin{bmatrix}
\alpha_1 & \alpha_2 & {\cdots} & \alpha_n
\end{bmatrix}$可逆则有$AP=P\Lambda\Rightarrow A=PAP^{-1}$.即我们得到矩阵可相似对角化的充要条件:$A$有$n$个线性无关的特征向量。对于不同的特征值，其对应的特征向量也线性无关，可通过反证法证得。若矩阵有$n$个不同的特征向量，则矩阵必定能相似对角化。

下面给出一种生成无法相似对角化矩阵的方法：考虑如下矩阵$A=[a_{ij}]_{n \times n}$，设$\alpha,\beta$为$n阶$非零正交向量，令$A=E+\alpha\beta^T$,则$A$无法相似对角化。下面给出证明：$\mathrm{tr}A=\mathrm{tr}E+\mathrm{tr}\alpha\beta^T=n$，又有$\mathrm{r}(A-E)=\mathrm{r}(\alpha\beta^T)=1$，故对应于特征值1的线性无关的特征向量一共有$n-1$个，则$1$至少是$n-1$重特征值。根据式2.1，最后一个特征值也为$1$，故矩阵$A$有$n$重特征值$1$，且只有$n-1$个线性无关的特征向量，故A无法相似对角化。

#### 实对称矩阵的相似对角化

元素$a_{ij}$都是实数的对称矩阵称为实对称矩阵，$a_{ij}$是实数$\Leftrightarrow \bar a_{ij}=a_{ij}$($\bar a_{ij}$是$a_{ij}的共轭$)记$\bar A=[\bar a_{ij}]$，则$A$是实对称矩阵$\Leftrightarrow A^{\mathrm{T}}=A$且$\bar A=A$。

实对称矩阵有一些非常好的性质，
-   实对称矩阵属于不同特征值对应的特征向量相互正交
-   实对称矩阵必相似于对角阵，即存在可逆矩阵$P$使得$P^{-1}AP=\Lambda.$且存在正交阵$Q$使得$Q^{-1}AQ=Q^\mathrm{T}AQ=\Lambda$

若$A$是$n$阶实对称矩阵，$\lambda_1,\lambda_2,\cdots,\lambda_n$是$A$的特征值，$\mathbf{\xi_1},\mathbf{\xi_2},\cdots,\mathbf{\xi_n}$是$A$的分别对应于$\lambda_1,\lambda_2,\cdots,\lambda_n$的标准正交向量，令$Q=(\mathbf{\xi_1},\mathbf{\xi_2},\cdots,\mathbf{\xi_n})$，则$Q$是标准正交矩阵。且有

$$
Q^{-1}AQ=Q^\mathrm{T}AQ=\begin{bmatrix}
\lambda_1 & & & \\
& \lambda_2 & & \\
& & \ddots & \\
& & & \lambda_n
\end{bmatrix}
$$

$$
A=Q\begin{bmatrix}
\lambda_1 & & & \\
& \lambda_2 & & \\
& & \ddots & \\
& & & \lambda_n
\end{bmatrix}Q^\mathrm{T}=
$$

$$
(\mathbf{\xi_1},\mathbf{\xi_2},\cdots,\mathbf{\xi_n})\left\{
\begin{bmatrix}
\lambda_1 & & & \\
& 0 & & \\
& & \ddots & \\
& & & 0
\end{bmatrix}+
\begin{bmatrix}
0 & & & \\
& \lambda_2 & & \\
& & \ddots & \\
& & & 0
\end{bmatrix}+
\cdots+
\begin{bmatrix}
0 & & & \\
& 0 & & \\
& & \ddots & \\
& & & \lambda_n
\end{bmatrix}
\right\}
\begin{bmatrix}
\mathbf{\xi^\mathrm{T}_1} \\ \mathbf{\xi^\mathrm{T}_2} \\ {\vdots} \\ \mathbf{\xi^\mathrm{T}_n}
\end{bmatrix}
$$

$$
=((\lambda_1\mathbf{\xi_1},\mathbf{0},\cdots,\mathbf{0})+(\mathbf{0},\lambda_2\mathbf{\xi_2},\cdots,\mathbf{0})+\cdots+(\mathbf{0},\mathbf{0},\cdots,\lambda_1\mathbf{\xi_1}))\begin{bmatrix}
\mathbf{\xi^\mathrm{T}_1} \\ \mathbf{\xi^\mathrm{T}_2} \\ {\vdots} \\ \mathbf{\xi^\mathrm{T}_n}
\end{bmatrix}
$$

$$
=\lambda_1\mathbf{\xi_1}\mathbf{\xi^\mathrm{T}_1}+\lambda_2\mathbf{\xi_2}\mathbf{\xi^\mathrm{T}_2}+\cdots+\lambda_n\mathbf{\xi_n}\mathbf{\xi^\mathrm{T}_n}
$$

即$A$可以表示为$n$个秩为1的实对称矩阵的和。