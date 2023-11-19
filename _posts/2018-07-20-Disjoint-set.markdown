---
layout: post-mathjax
title: "多连通域边界提取分类与并查集"
date: 2018-07-20 15:20
disqus: true
categories: Computer&nbsp;Graphics
---

> 设D是一区域，若属于D内任一简单闭曲线的内部都属于D，则称D为单连通域

#### 多连通域边界提取分类

最近遇到多连通域图形的边界点的提取和分类的问题，由于数据结构实现方面的一些限制，使得边界提取的函数访问到每条边的顺序都是随机的。由于是多连通域的图形，边界不只是一条闭曲线，自然地出现了边界点的分类问题。参考下图：

![borders](../../../../assets/images/figure_border.PNG)

如何区分图中的长方形边界与心型边界？如果长方形内部有更多闭曲线围成的其它图形呢？将问题推广总结一下就是：**随机遍历一个多连通域图形的边界，将边界上的点按照不同的内外边界进行分类**

一开始的想法是用机器学习的方法去训练和提取特征，但是这种简单问题似乎并不值得如此大费周章。直到突然想起了一个特殊的数据结构--并查集。因为内外边界上的点不会有边相连，所以只需要遍历边界边，将边界边两端的点加入到同一集合就可以了。而利用并查集的特性，可以将时间复杂度降到O(n)。对于内部多个闭曲线的情况同样适用。提取到的内边界如下图：

![inner border](../../../../assets/images/figure_inner_border.PNG)

#### 并查集

对于并查集，有两个重要的特性：

- 支持两种操作：并、查，分别是合并两个集合，查询两个元素是否属于同一集合
- 整体结构是一个森林，森林中每棵树表示一个集合

具体实现上，经常运用一个数组来表示每个元素在树上的父亲节点，下面看看代码：

```c++
class DisjointSet {
public:
	unsigned int size;
	int *father;

	DisjointSet(unsigned int s) {
		size = s;
		father = new int[s];
		memset(father, -1, sizeof(int)*s);
	}

	int get_root(int x) {
		if (father[x] < 0)
			return x;
		else
			return father[x] = get_root(father[x]);
	}
    
	void union_set(int x, int y) {
		x = get_root(x);
		y = get_root(y);
		if (x != y)
			father[x] = y;
	}
    
	bool query(int x, int y) {
		x = get_root(x);
		y = get_root(y);
		return x == y;
	}

	~DisjointSet() {
		delete[] father;
	}
};
```

这里运用了一个小trick来简化树的模型（get_root函数最后一行），即路径压缩的方法，减小了表示集合的树的深度。使用路径压缩后，get_root函数操作的时间复杂度变为了$O(n*\alpha(n))$，其中$\alpha(n)$是反阿克曼函数，基本可以认为是常数。

并查集还用于最小生成树的Kruskal算法，某种程度上和这里分类的思想是一种同构。有时候寻找一个问题的答案，也只是寻找某种同构的过程。而似乎哥德尔定理给出的答案是不存在这样完全的形式系统能够包含所有的真理，并维持该形式系统的一致性。最后看看《GEB》里提到的一个禅宗公案，一笑尔：

南泉因赵州问：“如何是道？”

泉云：“平常心是道。”

州云：“还可趣向否？”

泉云：“拟向即乖！”

州云：“不拟怎知是道？”

泉云：“道不属知，不属不知；知是妄觉，不知是无记。若真达不疑之道，犹如太虚廓然洞豁，岂可说是非耶！”
