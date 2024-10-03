---
layout: post
title: 大模型教我学大模型
date: 2023-11-30 8:20
mathjax: true
disqus: true
categories: Artificial&nbsp;Intelligence
---

> LLM的正确用法

最近要被面，跑去疯狂搜索相关面试题，把一些社交媒体上收集到的问题搬过来，拿AI来解决一下，主要是new bing。

魔法咒语：假设你现在是一个大模型算法专家来我的公司应聘大模型算法工程师，我是面试官，接下来我会提出一些大模型相关的问题，请你如实准确地回答我的问题，在后续的回答中，请在每个段落的开头前加入>符号，可以开始吗？

1. 推理引擎加速Int8量化的方法有哪些？可否介绍一下PTQ和QAT的区别？
>在推理引擎中，Int8量化是一种常见的方法来加速模型的推理过程。这种方法将模型参数从原始的浮点数转换为适合于边缘设备的低比特宽度（如8位或4位）的固定点模型。其目的是在保持模型性能的同时降低模型的复杂性和大小，以便在硬件受限的设备上部署和加速推断时间。
>目前主流的神经网络量化方式有PTQ和QAT两种：
>- 训练后量化 (Post Training Quantization, PTQ)：这种方法无需数据集和训练，直接量化模型权重。PTQ是一种在模型训练完成后进行的量化方法，它需要用具有代表性的数据集进行校准，以确定激活的最佳量化参数。
>- 量化感知训练 (Quantization Aware Training, QAT)：这种方法在量化后需要在数据集上继续微调训练。QAT是一种在训练过程中对量化数值进行建模的方法。在QAT中，模型在训练过程中就已经考虑到了量化的影响，因此在量化后的模型可以直接用于推理，无需再进行校准。
>
>总的来说，PTQ和QAT的主要区别在于，PTQ是在模型训练完成后进行的量化，而QAT则是在模型训练过程中就已经考虑到了量化的影响。

2. Transformer的层融合是如何做到的？了解英伟达是如何做层融合的么？
> Transformer的层融合主要是通过使用多头注意力机制来实现的。多头的意思是每个头都从词义层面分割输出张量，也就是每个头都想获得一组Q，K，V进行注意力机制的计算，句子中每个词只表示句子的一部分，所以将每个词的计算结果拼接到一起形成最终结果。
>
> 至于英伟达如何做层融合，他们的TensorRT优化库通过对层间的横向或纵向合并，使得层的数量大大减少。横向合并可以把卷积、偏置和激活层合并成一个CBR结构，只占用一个CUDA核心。英伟达的CBR结构是指将神经网络的卷积（Convolution，C）、批量归一化（Batch Normalization，B）和激活函数（ReLU，R）三个层融合为一个层1。这种垂直整合的方式可以大大减少网络层的数量，从而提高模型的执行速度。
> 这种方法可以有效地减少数据流通次数以及显存的频繁使用，从而提高模型的执行速度4。希望这个解答对你有所帮助！

3. 训练一个Transformer的encoder和decoder有什么区别？谈一谈为何decoder难以加速?
> 在Transformer模型中，Encoder和Decoder有以下区别：
> - Encoder：Transformer中的Encoder是用于将输入序列转换成隐藏表示的模块。它将输入序列中的每一个位置的词嵌入向量作为初始输入，然后通过多层的自注意力机制和全连接层，将每个位置的信息编码成一个定长的隐藏向量表示。Encoder的输出可以被送入Decoder中进行下一步处理。
> - Decoder：Decoder的工作是根据Encoder的输出以及已经生成的部分目标序列，生成下一个目标序列的元素。在Decoder中，每一步的输入包括来自Encoder的上下文向量和前一步Decoder的输出。Decoder会将自己的输出当做接下来的输入。
>
> 关于为什么Decoder难以加速，主要原因在于其生成过程的自回归性质。在Transformer的Decoder中，生成下一个元素时需要依赖于前面已经生成的所有元素，这就导致了无法进行并行计算。具体来说，Decoder在生成序列的过程中，每一步都需要等待前一步的输出，然后将这个输出作为下一步的输入，这个过程是无法并行化的。因此，虽然Transformer的Encoder可以实现并行计算，但是由于这种依赖关系，Decoder的计算过程难以加速。

4. glm, llama, gpt, bert等大模型基础架构是什么样的？这些大模型各自有哪些特点？它们之间的区别是什么？
> 以下是我从网络上找到的关于GLM、LLaMA、GPT和BERT模型的基础架构和特点的信息：
> - GLM模型：
GLM是一个通用的预训练语言模型，它在自然语言理解、条件文本生成和非条件文本生成上都有着不错的表现1。
GLM的核心是：自编码，随机MASK输入中连续跨度的token；自回归，基于自回归空白填充的方法重新构建跨度中的内容；2维的编码技术，来表示跨间和跨内信息。
> - LLaMA模型：
LLaMA是由MetaAI的Facebook人工智能实验室（FAIR）发布的开放使用的预训练语言模型。
与其他大型语言模型一样，LLaMA的工作原理是将一连串的单词作为输入，并预测下一个单词，以递归地生成文本。
> - GPT模型：
GPT模型是一种基于Transformer的语言模型，其基本原理是使用大规模语料库进行预训练，再在特定任务上进行微调，从而得到对该任务的优化模型。
GPT取自Tranformer的解码器，采用生成式预训练， 具有自回归特性。
> - BERT模型：
BERT模型由多层双向的Transformer编码器组成，由12层组成，768隐藏单元，12个head，总参数量110M，约1.15亿参数量。
BERT取自Transformer的编码器，采用掩码语言模型和下一句预测等任务进行预训练，不具有自回归特性。
这些模型之间的主要区别在于它们的预训练策略和模型架构：
>
> GLM模型使用自编码和自回归的方法进行预训练，可以同时处理自然语言理解和生成任务。
>
> LLaMA模型使用一连串的单词作为输入，并预测下一个单词，以递归地生成文本。
>
> GPT模型采用生成式预训练， 具有自回归特性。
>
> BERT模型采用掩码语言模型和下一句预测等任务进行预训练，不具有自回归特性。

5. roberta为什么去掉了nsp任务，为什么选择动态掩码？
> RoBERTa模型在BERT的基础上做了一些改进，包括去掉了Next Sentence Prediction (NSP)任务和引入了动态掩码策略¹²⁴⁵⁶⁷。
>
> **去掉NSP任务**：在BERT模型中，NSP任务是预测两个句子是否连续。然而，RoBERTa的研究者发现，去掉NSP任务可以提升下游任务的性能¹²⁴⁵。他们进行了多组实验，包括使用真实句子对+NSP，成对句子段+NSP（BERT的做法），连续长句拼接（句子可跨文档，无NSP），以及同上，句子不可跨文档（无NSP）。结果显示，无NSP任务的训练方式效果优于有NSP任务的训练方式⁵。
>
> **选择动态掩码**：BERT模型在预处理阶段就对数据进行一次随机掩码，得到一个静态掩码。而RoBERTa模型在每次向模型输入一个序列时都会生成新的掩码模式，这就是动态掩码¹²⁴⁵⁶⁷。动态掩码的好处是在不增大训练数据集的前提下，增加模型训练的数据多样性⁶。这样，在大量数据不断输入的过程中，模型会逐渐适应不同的掩码策略，学习不同的语言表征⁴。
>
> 这些改进使得RoBERTa模型在多项NLP任务上的表现超过了原始的BERT模型¹²⁴⁵⁶⁷。希望这个解释对您有所帮助！如果您还有其他问题，欢迎继续提问。
>
> 源: 与必应的对话， 2023/11/30
(1) RoBERTa: Robustly Optimized BERT pre-training Approach - OpenGenus IQ. https://iq.opengenus.org/roberta/.
(2) 【原理】预训练模型之自然语言理解--RoBERTa - 知乎. https://zhuanlan.zhihu.com/p/430751851.
(3) RoBERTa模型原理总结 - 知乎. https://zhuanlan.zhihu.com/p/347861417.
(4) RoBERTa论文详解和代码实战 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/143064748.
(5) 深入理解深度学习——BERT派生模型：RoBERTa ... - CSDN博客. https://blog.csdn.net/hy592070616/article/details/131354852.
(6) 详解RoBERTa: A Robustly Optimized BERT Pretraining Approach - 知乎. https://zhuanlan.zhihu.com/p/593708268.
(7) NLP预训练模型4 -- 训练方法优化（RoBERTa、T5） - 知乎. https://zhuanlan.zhihu.com/p/178937674.
(8) RoBERTa | 一隅. https://tqnwhz.github.io/blog/2021/09/03/RoBERTa/.

6. 介绍一下instructGPT，介绍一下RLHF
> **InstructGPT** 是一种基于语言模型的自然语言处理技术，旨在解决指令性任务（instructional tasks），例如问答、推荐、提示、教育等领域⁴。InstructGPT 是 OpenAI 的一种 GPT 风格的语言模型，通过对 GPT-3 进行微调，使其能够使用人类的反馈来遵循指令³。InstructGPT 和 ChatGPT 在模型结构，训练方式上都完全一致，即都使用了指示学习（Instruction Learning）和人类反馈的强化学习（Reinforcement Learning from Human Feedback，RLHF）来指导模型的训练，它们不同的仅仅是采集数据的方式上有所差异²。
>
> **RLHF**（Reinforcement Learning from Human Feedback）是一种基于强化学习的算法，通过结合人类专家的知识和经验来优化智能体的学习效果⁹。与传统的强化学习算法相比，RLHF 不仅考虑到了智能体的行为奖励，还融合了人类专家的反馈信息，使得模型能够更快地学习到有效的策略⁸。RLHF 是现代 LLM 训练流程中不可或缺的一部分，因为它可以将人类偏好整合到优化图景中，从而提升模型的有用性和安全性⁸。
>
> 希望这些信息对您有所帮助！如果您还有其他问题，欢迎随时向我提问。
>
> 源: 与必应的对话， 2023/11/30
(1) InstructGPT介绍 - 极术社区 - 连接开发者与智能计算生态. https://aijishu.com/a/1060000000387749.
(2) Instruct GPT - Instruct GPT - DataLearner. https://www.datalearner.com/ai-models/pretrained-models/instruct-gpt.
(3) ChatGPT/InstructGPT详解 - 知乎. https://zhuanlan.zhihu.com/p/590311003.
(4) 深入浅出讲 RLHF（RL with human feedback）-CSDN博客. https://blog.csdn.net/m0_72410588/article/details/130439047.
(5) LLM成功不可或缺的基石：RLHF及其替代技术 - 知乎. https://zhuanlan.zhihu.com/p/659724235.
(6) InstructGPT - 知乎. https://www.zhihu.com/topic/26732358.
(7) ChatGPT/InstructGPT详解_数据派THU的博客-CSDN博客. https://blog.csdn.net/tMb8Z9Vdm66wH68VX1/article/details/128928143.
(8) . https://bing.com/search?q=RLHF%e4%bb%8b%e7%bb%8d.
(9) ChatGPT 背后的“功臣”——RLHF 技术详解 - 知乎. https://zhuanlan.zhihu.com/p/599016986.
(10) undefined. https://web.stanford.edu/class/cs224n/slides/cs224n-2023-lecture11-prompting-rlhf.pdf.
(11) undefined. https://arxiv.org/pdf/2203.02155.pdf.
(12) undefined. https://crfm.stanford.edu/alpaca/.
(13) undefined. https://arxiv.org/abs/2212.10560.
(14) undefined. https://github.com/yizhongw/self-instruct.
(15) undefined. https://zhuanlan.zhihu.com/p/591474085.
(16) undefined. https://zhuanlan.zhihu.com/p/631238431.
(17) undefined. https://www.ai.pku.edu.cn/info/1053/2496.htm.

7. glm, llama, gpt, bert的训练方式各自是什么样的？
> 以下是这四种模型的训练方式的简要概述：
>
> - **GLM (General Language Model)**：GLM的核心创新点是提出了自回归空白填充（Autoregressive Blank Infilling）的自监督训练方式。通过调整空白块的大小，GLM即可以像encoder-only的模型那样进行NLU任务（文本分类等），也可以像decoder-only模型那样进行NLG任务（文本生成等），还可以像seq-to-seq模型那样进行条件NLG任务（对话，机器翻译等）⁸⁹[^10^]¹¹。
>
> - **LLAMA**：LLAMA 2的训练过程从使用公开可用的在线资源对Llama 2进行预训练开始。接下来，通过应用有监督微调，创建了Llama 2-Chat的初始版本。随后，使用人类反馈强化学习（RLHF）方法，具体是通过拒绝采样和近端策略优化（PPO），对模型进行迭代优化⁵。
>
> - **GPT (Generative Pretrained Transformer)**：GPT采用了Hinton等人 (2006)提出的一种经典的神经网络训练策略:”预训练+微调”的二段式训练策略。在预训练阶段，基于庞大的生语料训练一个生成式语言模型；在微调阶段，使用标注数据继续训练模型¹⁴。
>
> - **BERT (Bidirectional Encoder Representations from Transformers)**：BERT的训练与结构 BERT采用了Hinton等人 (2006)提出的一种经典的神经网络训练策略:”预训练+微调”的二段式训练策略。在预训练阶段，基于庞大的生语料训练一个生成式语言模型；在微调阶段，使用标注数据继续训练模型¹⁵¹⁶。
>
> 以上是这四种模型的训练方式的简要概述，如果你需要更详细的信息，可以查阅相关的学术论文和技术文档。希望这个回答对你有所帮助！
>
> 源: 与必应的对话， 2023/11/30
(1) . https://bing.com/search?q=GLM%e6%a8%a1%e5%9e%8b%e8%ae%ad%e7%bb%83%e6%96%b9%e5%bc%8f.
(2) GLM: 自回归空白填充的通用语言模型预训练 - 知乎. https://zhuanlan.zhihu.com/p/560559133.
(3) 清华大学通用预训练模型：GLM - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/637382548.
(4) 预训练语言模型：GLM - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/641499380.
(5) . https://bing.com/search?q=LLAMA%e6%a8%a1%e5%9e%8b%e8%ae%ad%e7%bb%83%e6%96%b9%e5%bc%8f.
(6) GPT——生成式预训练Transformer - 知乎 - 知乎专栏. https://bing.com/search?q=GPT%e6%a8%a1%e5%9e%8b%e8%ae%ad%e7%bb%83%e6%96%b9%e5%bc%8f.
(7) 【ChatGPT】如何正确的训练gpt的详细教程_徐浪老师的博客-CSDN博客. https://blog.csdn.net/liaozp88/article/details/130292945.
(8) Bert原理细节及训练理解_linux bert分布式训练-CSDN博客. https://blog.csdn.net/headonenjoy/article/details/105305825.
(9) BERT是怎么训练的? - 知乎. https://www.zhihu.com/question/439193113.
(10) GPT——生成式预训练Transformer - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/125139937.
(11) 搞懂GPT，只需看这些！ - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/403469926.
(12) 【llm大语言模型】一文看懂llama2(原理,模型,训练) - 知乎. https://zhuanlan.zhihu.com/p/651248009.
(13) 一文读懂Llama 2（从原理到实战） - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/653303123.
(14) 论文阅读_GLM - 简书. https://www.jianshu.com/p/56ccdafa537e.
(15) 【深度学习】BERT详解 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/130913995.
(16) 如何从零开始训练BERT模型 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/387330158.
(17) undefined. https://bluemonkeysports.com/what-is-llama-in-spanish/.
(18) undefined. https://www.britannica.com/animal/llama.
(19) undefined. https://www.spirit-animals.com/llama-symbolism/.
(20) undefined. https://www.thoughtco.com/fun-facts-about-llamas-3880940.

8. chatgpt相对于gpt3有哪些改进？
> ChatGPT是基于GPT-3架构的一种AI对话助手，它在对话场景中表现出色⁵。相较于GPT-3，ChatGPT进行了以下几方面的改进：
>
> 1. **更具互动性**：ChatGPT能够提供更加精准的回答，使得它在对话场景中表现更加出色⁵。
>
> 2. **指示学习（Instruct Learning）**：这是一种新的学习方式，可以帮助模型更好地理解用户的指示³。
>
> 3. **提示学习（Prompt Learning）**：这种学习方式可以帮助模型更好地理解和响应用户的提示³。
>
> 4. **微调（Fine-tune）**：通过微调，可以使模型更好地适应特定的任务³。
>
> 5. **人工反馈的强化学习（Reinforcement Learning from Human Feedback）**：通过人工反馈的强化学习，可以使模型的表现更加接近人类的期望³。
>
> 总的来说，ChatGPT相对于GPT-3不仅参数量大大减少，且在聊天领域的文本生成能力大大增加³。这些改进使得ChatGPT在处理对话任务时，能够更好地理解上下文、识别意图并提供适当的响应⁴。希望这个回答对你有所帮助！
>
> 源: 与必应的对话， 2023/11/30
(1) 深入浅出：了解ChatGPT及其与GPT-3和GPT-4的区别 - CSDN博客. https://blog.csdn.net/yinzhangheng/article/details/130309743.
(2) ChatGPT：形成机理与问题应对 - 百家号. https://baijiahao.baidu.com/s?id=1760217241892678910.
(3) GPT-3和ChatGPT有什么不同？ - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/590370084.
(4) GPT / GPT-2 / GPT-3 / InstructGPT 进化之路 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/609716668.
(5) 一文搞懂Transformer、GPT、ChatGPT、LLM、AIGC和LangChain的区别 - 知乎. https://zhuanlan.zhihu.com/p/647391226.

9. 使用LoRA等微调方式训练垂直领域的时候如何保证通用对话能力不会丢失？
> 在使用LoRA等微调方式训练垂直领域的时候，确保通用对话能力不会丢失是一个重要的问题。以下是一些可能的方法：
>
> 1. **混合数据**：在微调阶段，可以在特定领域的数据中混入一定比例的通用领域数据³。这样可以帮助模型在学习特定领域知识的同时，保持其在通用对话任务上的性能。
>
> 2. **低秩自适应（LoRA）**：LoRA是一种轻量级的微调方法，它通过优化适应过程中密集层变化的秩分解矩阵，来间接训练神经网络中的一些密集层，同时保持预先训练的权重不变¹²。这种方法可以有效地减少参数的数量，降低训练成本，同时保持模型的通用对话能力。
>
> 3. **选择合适的微调层**：在使用LoRA进行微调时，选择合适的微调层也很重要。例如，对于基于Transformer的模型，LoRA通常只对每层的Self-Attention的部分进行微调²。
>
> 4. **选择合适的秩**：在LoRA微调中，选择合适的秩（即低秩分解中的秩）也很关键。秩的选择需要根据任务的具体需求和模型的性能进行权衡⁵。
>
> 以上是一些可能的方法，具体的实施可能需要根据具体的模型和任务进行调整。希望这个回答对你有所帮助！
>
> 源: 与必应的对话， 2023/11/30
(1) 在大模型下，对于垂直领域 有必要从头训练一个大模型吗，微调方式可以替代训练大模型方式吗？ - 知乎. https://www.zhihu.com/question/603629117.
(2) LORA：大模型轻量级微调 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/623543497.
(3) 大语言模型微调实践——LoRA 微调细节 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/651338142.
(4) 参数高效微调方法：LoRA - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/629627768.
(5) 简单理解大模型参数高效微调中的LoRA(Low-Rank Adaptation)_xiongxyowo的博客-CSDN博客. https://blog.csdn.net/qq_40714949/article/details/131988734.

10. chatglm和chatgpt相比在哪些方面有优势？二者在分词方式上有什么区别？
> ChatGLM和ChatGPT都是基于Transformer架构的大模型，它们在一些方面有所不同：
>
> 1. **模型架构**：ChatGLM采用了编码器-解码器架构，前半部分采用类似于Bert的双向注意力，后半部分采用类似于GPT的自回归架构进行预测；而ChatGPT采用的是仅解码器架构¹。
>
> 2. **模型训练方法**：ChatGLM是基于Base模型进行有监督微调（SFT）训练而来，而ChatGPT是基于人工反馈的强化学习（RLHF）训练而来¹。
>
> 3. **模型参数规模**：ChatGLM模型参数量仅62亿，而ChatGPT无论是GPT3.5还是GPT4都是上千亿级规模的参数量¹。
>
> 关于分词方式，我没有找到具体的信息。但一般来说，这两种模型都可能使用子词分词（subword tokenization）方法，这种方法可以处理词汇表之外的词，也可以处理多种语言，包括中文。
>
> 以上信息是根据搜索结果得出的，可能并不完全准确，如果需要更详细的信息，建议查阅相关的学术论文和技术文档。希望这个回答对你有所帮助！
>
> 源: 与必应的对话， 2023/11/30
(1) chatGLM和chatGPT的技术区别在哪里？ - 知乎. https://www.zhihu.com/question/604393963.
(2) What Is ChatGPT, and Why Is It Important? - How-To Geek. https://www.howtogeek.com/871071/what-is-chatgpt/.
(3) ChatGLM vs ChatGPT 的部分对比 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/614323117.
(4) ChatGPT 与 ChatGLM（清华开源中文大模型）对比 - 知乎. https://zhuanlan.zhihu.com/p/632915537.
(5) 简单对比一下ChatGPT和ChatGLM，国产语言模型怎么样？. https://baijiahao.baidu.com/s?id=1762947093140120326.
(6) 分词 -- 从源码解读LangChain-ChatGLM(二) - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/638929185.
(7) undefined. http://127.0.0.1:8000.

11. 用pytorch手写self-attention的代码
> 当然，以下是一个使用PyTorch实现的Self-Attention的基本代码：
>
> ```python
> import torch
> import torch.nn as nn
> class SelfAttention(nn.Module):
>     def __init__(self, embed_size, heads):
>         super(SelfAttention, self).__init__()
>         self.embed_size = embed_size
>         self.heads = heads
>         self.head_dim = embed_size // heads
>         assert (
>             self.head_dim * heads == embed_size
>         ), "Embedding size needs to be divisible by heads"
>    
>         self.values = nn.Linear(self.head_dim, self.head_dim, bias=False)
>         self.keys = nn.Linear(self.head_dim, self.head_dim, bias=False)
>         self.queries = nn.Linear(self.head_dim, self.head_dim, bias=False)
>         self.fc_out = nn.Linear(heads * self.head_dim, embed_size)
>    
>     def forward(self, values, keys, query, mask):
>        N = query.shape[0]
>        value_len, key_len, query_len = values.shape[1], keys.shape[1], query.shape[1]
>    
>        # Split the embedding into self.heads different pieces
>        values = values.reshape(N, value_len, self.heads, self.head_dim)
>        keys = keys.reshape(N, key_len, self.heads, self.head_dim)
>        query = query.reshape(N, query_len, self.heads, self.head_dim)
>    
>        values = self.values(values)  # (N, value_len, heads, head_dim)
>        keys = self.keys(keys)  # (N, key_len, heads, head_dim)
>        queries = self.queries(query)  # (N, query_len, heads, heads_dim)
>    
>        # Einsum does matrix mult. for query*keys for each every batch and every head
>        energy = torch.einsum("nqhd,nkhd->nhqk", [queries, keys])
>        # queries shape: (N, query_len, heads, heads_dim),
>        # keys shape: (N, key_len, heads, heads_dim)
>        # energy: (N, heads, query_len, key_len)
>    
>        if mask is not None:
>            energy = energy.masked_fill(mask == 0, float("-1e20"))
>    
>        attention = torch.softmax(energy / (self.embed_size ** (1 / 2)), dim=3)
>    
>        out = torch.einsum("nhql,nlhd->nqhd", [attention, values]).reshape(
>            N, query_len, self.heads * self.head_dim
>        )
>    
>        out = self.fc_out(out)
>        return out
>```
>
> 这个代码定义了一个`SelfAttention`类，它是`torch.nn.Module`的子类。这个类的主要方法是`forward`，它接收输入值、键和查询，并返回经过自注意力机制处理的输出。
>
> 注意，这只是一个基本的实现，实际使用时可能需要根据具体的需求进行修改或扩展。希望这个回答对你有所帮助！
>
> 源: 与必应的对话， 2023/11/30
(1) github.com. https://github.com/zaidhassanch/PointerNetworks/tree/6ccd5ebad877c9fbc10ac3af10114b4a6097700b/Tranformers%2FT003_transformer_translation%2Ftransformer2.py.
(2) github.com. https://github.com/Arunsoren/Pro_Transformers/tree/618ba415352cbe999e2f89bd09d18d6338fbf3d9/Transformer_from_Scratch.py.
(3) github.com. https://github.com/gurushreyaas2003/Fundamentals/tree/073abdecb99d6a1a9e1abec7b041e0106642d552/Transformers.py.
(4) github.com. https://github.com/moein-shariatnia/Transformer/tree/b56abee2a8434bd4da8b0135a5d8e35fa7a63d87/attention.py.
(5) github.com. https://github.com/VinACE/trans-vsumm/tree/d3b03fbe09f6d38b9a59ad9b8ceaa732c4f7340a/tvsumm_transform_v1.py.
(6) github.com. https://github.com/Walter-Phillips/transformers/tree/a08a6d9adcb89f09f9acf0a7cc2ee4395fc00d57/transformers.py.
(7) github.com. https://github.com/ishandutta0098/paper-implementations/tree/b15a6291d0a4e4d02a1285213df201723d81e675/Architectures%2FTransformers%2Fself_attention.py.
(8) github.com. https://github.com/rishabh279/Machine-Learning-from-Scratch/tree/d6ee760f3dc8c4c8608ee1e01fe10016812e56ec/Deep_Learning%2FNatural_Language_Processing%2Ftransformers.py.
(9) github.com. https://github.com/shipsails/deep_learning/tree/a3c967b162d8e77f87e672d414aff813da872c83/my_transformer.py.



12. bert跟transformer的位置编码方式有什么区别？还有其它的位置编码方式吗？
> BERT和Transformer的位置编码方式有一些区别：
>
> 1. **Transformer的位置编码**：在Transformer中，位置编码是由sin/cos函数生成的固定值。具体做法是用不同频率的正余弦函数对位置信息进行编码，位置编码向量的维度与文本编码向量的维度相同，即d_model。因此二者可以直接相加作为token最终的编码向量⁶。
>
> 2. **BERT的位置编码**：在BERT中，与一般的词嵌入编码类似，位置编码也是随机生成且可训练的，维度为[seq_length, width]，其中seq_length代表序列长度，width代表每一个token对应的向量长度⁶。
>
> 两者的主要区别在于，Transformer的位置编码是一个固定值，因此只能标记位置，但是不能标记这个位置有什么用。而BERT的位置编码是可学习的Embedding，因此不仅可以标记位置，还可以学习到这个位置有什么用⁶。
>
> 除了BERT和Transformer的位置编码方式，还有其他的位置编码方式，例如：
>
> 1. **Learnable绝对位置编码**：这种位置编码方式是将位置的表示加到token的表示上，而每个位置的表示则为一个可学习的向量。这种编码方式被BERT、GPT2、ERNIE、ALBERT、electra等模型所采用²。
>
> 2. **Fixed绝对位置编码**：以三角式位置编码为代表。在三角式位置编码中，位置t对应的位置向量在偶数位和奇数位的值分别为：PE_{(t,2i)}=sin(t/10000^{2i/d_{model}})，PE_{(t,2i+1)}=cos(t/10000^{2i/d_{model}})，其中pos表示位置，i表示所在维度²。
>
> 3. **相对位置编码**：相对位置编码则是指在计算注意力得分的时候，直接考虑两个token之间的相对位置²。
>
> 以上是一些常见的位置编码方式，具体的实现可能需要根据具体的模型和任务进行调整。希望这个回答对你有所帮助！
>
> 源: 与必应的对话， 2023/11/30
(1) 『Transformer/BERT』Transformer和BERT的位置编码 - 知乎. https://zhuanlan.zhihu.com/p/495376104.
(2) Transformer学习笔记一：Positional Encoding（位置编码） - 知乎. https://zhuanlan.zhihu.com/p/454482273.
(3) 六种位置编码的代码实现及性能实验 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/415020704.
(4) 关于BERT模型的代码，位置编码到底是怎么起作用的呢？ - 知乎. https://www.zhihu.com/question/349684689.
(5) Transformer位置编码（改进） - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/634491363.
(6) 相对位置编码和绝对位置编码 - CSDN博客. https://blog.csdn.net/ding_programmer/article/details/131978957.
(7) bert和transformer的位置编码有什么区别？ - 知乎. https://www.zhihu.com/question/514892019.
(8) 【BERT】というNLPモデルの仕組み、意味やできることを解説！. https://crystal-method.com/topics/bert/.
(9) [1810.04805] BERT: Pre-training of Deep Bidirectional Transformers for .... https://arxiv.org/abs/1810.04805.
(10) 第一次见有人把Transformer、BERT和GPT大模型讲的这么通俗易懂！. https://zhuanlan.zhihu.com/p/618937672.

13. 数据并行与模型并行以及混合并行的训练方法有什么区别？
> 数据并行、模型并行和混合并行是深度学习中常用的三种并行训练方法，它们的主要区别在于并行的方式和目标¹²³：
>
> 1. **数据并行（Data Parallel）**：数据并行是将一个大的数据集分割成多个小的数据集，每个小数据集在一个单独的计算单元（如GPU）上进行计算。每个计算单元上都有相同的模型参数，在训练时输入不同的数据，相当于增大了训练时候的batch_size。这种方式的优点是可以处理大规模的数据集，缺点是可能需要更多的训练时间去达到模型收敛¹²⁴。
>
> 2. **模型并行（Model Parallel）**：模型并行是将一个大的模型分割成多个小的模型，每个小模型在一个单独的计算单元上进行计算。这种方式的优点是可以处理大规模的模型，缺点是可能需要更多的通信开销¹²³。
>
> 3. **混合并行（Hybrid Parallel）**：混合并行是数据并行和模型并行的结合，即在数据并行的基础上，进一步将每个计算单元上的模型进行模型并行。这种方式的优点是可以同时处理大规模的数据集和大规模的模型，缺点是实现复杂度较高¹²³。
>
> 以上是这三种并行训练方法的简要概述，具体的实现可能需要根据具体的模型和任务进行调整。希望这个回答对你有所帮助！
>
> 源: 与必应的对话， 2023/11/30
(1) 数据并行和模型并行的区别 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/179999281.
(2) 分布式并行总览 — MindSpore master documentation. https://www.mindspore.cn/tutorials/experts/zh-CN/r1.7/parallel/introduction.html.
(3) 机器学习模型并行训练 - guang_blog - 博客园. https://www.cnblogs.com/candl/p/16412267.html.
(4) 数据并行、模型并行、流水线并行 - 是小叶呀 - 博客园. https://www.cnblogs.com/yqw0710/p/16060765.html.
(5) undefined. https://zhuanlan.zhihu.com/p/71566775.
(6) undefined. https://zhuanlan.zhihu.com/p/87596314.
(7) undefined. https://www.cnblogs.com/rossiXYZ/p/15681576.html.

14. QAT量化中，round函数导数是多少？不可导的话是否研究过用一个函数替代？
> 在量化感知训练（Quantization Aware Training，QAT）中，round函数是不可导的。在反向传播过程中，这可能会导致问题，因为梯度无法通过round函数传播³。
>
> 为了解决这个问题，一种常见的做法是使用直通估计器（Straight-Through Estimator，STE），将round函数的导数在反向传播过程中设为1³⁶。这样，虽然不能精确地计算梯度，但可以使梯度通过round函数传播。
>
> 另外，也有一些研究尝试用一个可导函数来近似round函数。例如，DSQ方法引入了一个相对简单的函数来模拟round，做到计算简单，同时尽可能逼近round函数⁷。这种方法可以更好地反映量化误差，从而在低比特训练中减少精度损失⁷。
>
> 以上是关于QAT中round函数的一些基本信息，具体的实现可能需要根据具体的模型和任务进行调整。希望这个回答对你有所帮助！
>
> 源: 与必应的对话， 2023/11/30
(1) CNN max pooling、Relu、round 等环节梯度如何反传？ - CSDN博客. https://blog.csdn.net/qq_39575835/article/details/89090923.
(2) 量化QAT QLoRA GPTQ_taoqick的博客-CSDN博客. https://bing.com/search?q=QAT%e9%87%8f%e5%8c%96%e4%b8%ad%ef%bc%8cround%e5%87%bd%e6%95%b0%e5%af%bc%e6%95%b0.
(3) 量化训练之补偿STE：DSQ和QuantNoise - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/412957105.
(4) ROUND 函数 - Microsoft 支持. https://support.microsoft.com/zh-cn/office/round-%E5%87%BD%E6%95%B0-c018c5d8-40fb-4053-90b1-b3e7f61a213c.
(5) 内置函数 — Python 3.12.0 文档. https://docs.python.org/zh-cn/3/library/functions.html?highlight=round.
(6) snn可用代理梯度方法实现反向传播-CSDN博客. https://blog.csdn.net/weixin_73639838/article/details/133578595.
(7) Pytorch 可微分round函数_pytorch round-CSDN博客. https://blog.csdn.net/leelitian3/article/details/122706994.
(8) 量化感知训练（Quantization-aware-training）探索-从原理到实践 - 知乎. https://zhuanlan.zhihu.com/p/548174416.
(9) 量化QAT QLoRA GPTQ_taoqick的博客-CSDN博客. https://blog.csdn.net/taoqick/article/details/132502267.
(10) AdaRound，一种全新的量化思路--问题篇 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/473815530.
(11) undefined. https://www.bilibili.com/video/BV13s4y1D73L/.
(12) undefined. https://www.zhihu.com/search?q=%E5%82%85%E7%AB%8B%E5%8F%B6%E5%8F%98%E6%8D%A2%E4%B9%8B%E6%8E%90%E6%AD%BB%E6%95%99%E7%A8%8B&amp.

15. 谈一谈GPT的训练过程，分为哪三步？
> GPT的训练过程主要分为两个阶段³：
>
> 1. **预训练（Pre-training）阶段**：在这个阶段，模型基于大型的未标注语料库进行训练，学习到语言的一般特性。具体来说，GPT作为一个生成式语言模型，会尝试预测给定历史词汇的下一个词¹²。
>
> 2. **微调（Fine-tuning）阶段**：在这个阶段，模型使用标注数据进行训练，以适应具体的任务。这个阶段的训练目标是最小化预测和真实标签之间的差异¹²。
>
> 这两个阶段构成了GPT的基本训练过程。需要注意的是，这种“预训练+微调”的训练策略是一种经典的神经网络训练策略，被广泛应用于各种预训练模型中¹²。希望这个回答对你有所帮助！
>
> 源: 与必应的对话， 2023/11/30
(1) 【Pre-Training】GPT：通过生成式预训练改善语言理解-腾讯云开发者社区-腾讯云. https://cloud.tencent.com/developer/article/1665416.
(2) GPT——生成式预训练Transformer - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/125139937.
(3) GPT模型总结【模型结构及计算过程_详细说明】 - CSDN博客. https://blog.csdn.net/weixin_45577864/article/details/119651372.

16. 介绍一下迁移学习、多域建模，某些场景下数据很少，如何能更好地学习
> **迁移学习**⁵是机器学习中的一个概念，它是指一种学习对另一种学习的影响，或习得的经验对完成其他活动的影响。迁移学习专注于存储已有问题的解决模型，并将其利用在其他不同但相关问题上。例如，用来辨识汽车的知识（或者是模型）也可以被用来提升识别卡车的能力⁵。
>
> **多域建模**⁸[^10^]¹³是一种建模方法，它允许工程师使用混合建模方法创建基于仿真的数字孪生。这种方法可以处理来自多个工程领域的数据，例如机械、电气、控制、热、气动、液压、传动系统、热力、车辆动力、空调等领域的数据¹³。
>
> 在**数据稀缺**的情况下，有几种常见的策略可以帮助提高学习效果³：
> 1. **预训练+微调**：这种方法使用一个大规模的数据集训练一个神经网络，然后用较小的数据集微调此预训练网络¹。
> 2. **半监督学习**：这种方法在有标签数据和无标签样本上共同学习³。
> 3. **主动学习**：这种方法旨在选择最有价值的无标签样本进行收集，帮助我们在有限的预算下采取明智的行动³。
> 4. **预训练+数据集自生成**：给定一个良好的预训练模型，我们可以利用它生成更多的有标签样本³。
>
> 希望这些信息对您有所帮助！如果您有其他问题，欢迎随时向我提问。
>
> 源: 与必应的对话， 2023/11/30
(1) 迁移学习 (Transfer Learning) - 知乎. https://www.zhihu.com/topic/20079475/intro.
(2) 多域/多场景建模——One Model to Serve All - 知乎 - 知乎专栏. https://bing.com/search?q=%e5%a4%9a%e5%9f%9f%e5%bb%ba%e6%a8%a1%e4%bb%8b%e7%bb%8d.
(3) Simscape 产品信息 - MATLAB - MathWorks. https://ww2.mathworks.cn/products/simscape.html.
(4) 多工程建模和仿真 — Dymola 产品线 - Dassault Systèmes. https://www.3ds.com/zh/products-services/catia/products/dymola/key-advantages/.
(5) OpenAI 研究员谈半监督学习：数据不足情况下的学习方法 - 知乎. https://zhuanlan.zhihu.com/p/448073351.
(6) 数据太少怎么搞深度学习？ - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/91433630.
(7) 小样本学习研究综述 - 软件学报. https://jos.org.cn/html/2021/2/6138.htm.
(8) 针对训练集数量较少（或者极少）的样本，怎么样提高深度学习模型的分类性能？ - 知乎. https://www.zhihu.com/question/326209029.
(9) 迁移学习简介 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/441967399.
(10) 迁移学习之——什么是迁移学习（Transfer Learning） - 知乎. https://zhuanlan.zhihu.com/p/438117211.
(11) Ansys Twin Builder | 创建和部署数字孪生模型. https://www.ansys.com/zh-cn/products/digital-twin/ansys-twin-builder.
(12) 多域/多场景建模——One Model to Serve All - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/456963095.
(13) 如何使用维度建模_大数据开发治理平台 DataWorks-阿里云帮助中心. https://help.aliyun.com/zh/dataworks/use-cases/perform-dimensional-modeling.
(14) undefined. https://medium.com/@RaghavPrabhu/understanding-of-convolutional-neural-network-cnn-deep-learning-99760835f148.
(15) undefined. https://cs.nyu.edu/~fergus/papers/zeilerECCV2014.pdf.
(16) undefined. http://www.jos.org.cn/1000-9825/6138.htm.

17. 从数学角度解释梯度下降、反向传播
> **梯度下降**¹²是一种优化算法，用于找到函数的局部最小值。在神经网络中，这个函数通常是损失函数，我们希望通过调整网络参数（如权重和偏置）来最小化它。以下是梯度下降的基本步骤：
> 1. 初始化参数（如权重和偏置）。
> 2. 计算损失函数的梯度，即损失函数对每个参数的偏导数。梯度指向函数在当前点增长最快的方向。
> 3. 更新参数，使其沿着梯度的反方向移动。这是因为我们希望减小损失函数的值，而梯度的反方向指向函数在当前点减小最快的方向。参数的更新公式为：$$\theta = \theta - \alpha \nabla J(\theta)$$其中，$\theta$ 是参数，$\alpha$ 是学习率（决定了参数更新的步长），$\nabla J(\theta)$ 是损失函数 $J$ 对参数 $\theta$ 的梯度。
> 4. 重复步骤2和3，直到梯度接近0（即找到了局部最小值），或达到预设的最大迭代次数。
>
> **反向传播**⁵⁶⁷是一种有效计算神经网络损失函数梯度的算法。它是基于链式法则的递归应用。以下是反向传播的基本步骤：
> 1. 进行前向传播，计算每一层的输出，直到得到最后一层的输出，即网络的预测值。
> 2. 计算预测值与真实值之间的误差，这就是损失函数的值。
> 3. 对于网络中的每一层，从输出层开始，向输入层方向，计算损失函数对该层输入的偏导数，以及损失函数对该层参数（如权重和偏置）的偏导数。这一步是通过链式法则来完成的。
> 4. 利用上一步计算出的偏导数，使用梯度下降法更新每一层的参数。
>
> 这两种方法都是神经网络训练的基础，通过它们，我们可以优化网络的参数，使其在给定任务上表现得更好。希望这个回答对你有所帮助！
>
> 源: 与必应的对话， 2023/11/30
(1) 机器学习 第09集：梯度下降法数学公式 ( 含有笔记、代码、注释 ). https://zhuanlan.zhihu.com/p/161625734.
(2) 梯度下降算法公式推导 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/131320496.
(3) . https://bing.com/search?q=%e5%8f%8d%e5%90%91%e4%bc%a0%e6%92%ad%e6%95%b0%e5%ad%a6%e8%a7%a3%e9%87%8a.
(4) 通俗易懂举栗子--怎么理解反向传播算法？ - 知乎专栏. https://zhuanlan.zhihu.com/p/395323930.
(5) 深度学习 | 反向传播详解 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/115571464.
(6) 梯度下降_百度百科. https://baike.baidu.com/item/%E6%A2%AF%E5%BA%A6%E4%B8%8B%E9%99%8D/4864937.
(7) 机器学习笔记之梯度下降算法原理讲解-腾讯云开发者社区-腾讯云. https://cloud.tencent.com/developer/article/1675170.
(8) 反向传播求偏导原理简单理解-CSDN博客. https://blog.csdn.net/qq_38237214/article/details/108747251.
(9) undefined. https://zhuanlan.zhihu.com/p/25081671.
(10) undefined. https://zhuanlan.zhihu.com/p/447113449.

18. 说一下各种优化器的优缺点和适用场景
> 在深度学习中，优化器的选择是模型训练的重要部分。以下是一些常见的优化器及其优缺点和适用场景¹²：
>
> 1. **梯度下降（Gradient Descent）**：梯度下降是最基本的优化算法之一，它沿着梯度下降最快的方向求极小值¹。优点是简单易懂，适用于各种问题。缺点是可能陷入局部最优解，训练速度慢，且对学习率的选择较为敏感¹。
>
> 2. **随机梯度下降（Stochastic Gradient Descent，SGD）**：SGD每次只使用一个样本来计算梯度，训练速度快，适用于大规模数据集¹。优点是训练速度快，适用于大规模数据集。缺点是可能陷入局部最优解，训练过程中可能会有较大的波动¹。
>
> 3. **批量梯度下降（Batch Gradient Descent，BGD）**：BGD每次使用所有样本来计算梯度，训练速度慢，适用于小规模数据集¹。优点是可以更准确地估计梯度，收敛过程稳定。缺点是训练速度慢，不适合大规模数据集¹。
>
> 4. **动量优化（Momentum）**：动量优化引入了物理学中的动量概念，可以加速SGD的收敛，抑制震荡¹。优点是可以加速收敛，抑制震荡。缺点是可能陷入局部最优解，对参数的选择较为敏感¹。
>
> 5. **自适应学习率优化算法（AdaGrad）**：AdaGrad算法可以自动调整学习率，适用于稀疏数据¹。优点是可以自动调整学习率，适用于稀疏数据。缺点是学习率可能过早地变得非常小¹。
>
> 以上是一些常见的优化器，具体的选择需要根据具体的模型和任务进行调整。希望这个回答对你有所帮助！
>
> 源: 与必应的对话， 2023/11/30
(1) 收藏版｜史上最全机器学习优化器Optimizer汇总 - 知乎. https://zhuanlan.zhihu.com/p/416979875.
(2) 从SGD到Adam：深度学习中常用优化器的总结 - 知乎. https://zhuanlan.zhihu.com/p/420419258.
(3) 常见的优化算法有哪些?他们各自的优缺点是什么? - 知乎. https://zhuanlan.zhihu.com/p/658036941.
(4) 优化器(Optimizer) - 知乎. https://zhuanlan.zhihu.com/p/261695487.

19. LN和BN有什么区别，哪些结构用LN，请解释为什么。文本为什么用LN，请从batch的可比性回答。
> LN（Layer Normalization）和 BN（Batch Normalization）是两种常用的标准化方法，它们的主要区别在于标准化的方向⁵。
>
> - **BN**：对一个batch内的每个特征进行标准化，即对每一列（特征）进行缩放⁵。这使得不同样本的同一特征在BN处理后仍然保留了之前的大小关系，但样本内部的各个特征之间的大小关系可能会改变⁶。
> - **LN**：对每个样本的所有特征进行标准化，即对每一行进行缩放⁵。这使得一个样本内不同特征之间的大小关系被保留，但不同样本间的相同特征的大小关系可能会改变⁶。
>
> 在深度学习中，LN和BN的使用取决于具体的应用场景。在自然语言处理（NLP）领域，LN更为常用¹³。这是因为在处理文本时，我们通常会将一批文本组成一个batch，而BN的操作方向是对每句话的第一个词进行操作。然而，语言文本的复杂性很高，任何一个词都有可能放在初始位置，且词序可能并不影响我们对句子的理解¹。因此，BN在这种情况下并不符合NLP的规律¹。
>
> 相反，LN是针对一句话进行缩放的，且LN一般用在第三维度，如 `[batchsize, seq_len, dims]` 中的dims，一般为词向量的维度，或者是RNN的输出维度等等，这一维度各个特征的量纲应该相同¹。因此，LN能够更好地保留一个样本内不同特征之间的大小关系，这对NLP任务是至关重要的⁶。
>
> 总的来说，LN和BN都是为了让数据在某个维度上归一化，以解决深度学习中的“Internal Covariate Shift”问题¹。然而，由于BN和LN的操作方向不同，它们在处理不同类型的数据时，如图像（常用BN）和文本（常用LN），具有不同的适用性¹³⁵⁶。希望这个解释对你有所帮助！
>
> 源: 与必应的对话， 2023/11/30
(1) 超细节的BatchNorm/BN/LayerNorm/LN知识点 - 知乎. https://zhuanlan.zhihu.com/p/519419665.
(2) 一文搞懂Batch Normalization 和 Layer Normalization - 知乎. https://zhuanlan.zhihu.com/p/647813604.
(3) NLP中 batch normalization与 layer normalization - 知乎. https://zhuanlan.zhihu.com/p/74516930.
(4) BatchNorm和LayerNorm有什么不同？为什么CV方向的网络都是BN，而nlp方向的模型一般都用LayerNorm？. https://zhuanlan.zhihu.com/p/539148685.
(5) ln命令 – 为文件创建快捷方式 - Linux命令大全(手册). https://www.linuxcool.com/ln.
(6) 【精选】linux ln命令详解_牛奔的博客-CSDN博客. https://blog.csdn.net/Guzarish/article/details/118626384.
(7) 详解深度学习中的Normalization，BN/LN/WN - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/33173246.
(8) LN和BN对比 - 光彩照人 - 博客园. https://www.cnblogs.com/gczr/p/12597344.html.
(9) BN、LN、IN、GN的区别_bn层和gn层的区别-CSDN博客. https://blog.csdn.net/qq_41845478/article/details/107562000.
(10) 深度学习之9——逐层归一化(BN，LN) - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/69502704.
(11) linux ln命令详解 - 牛奔 - 博客园. https://www.cnblogs.com/niuben/p/14651192.html.
(12) undefined. https://blog.csdn.net/shanglianlm/article/details/85075706.
(13) undefined. https://www.semanticscholar.org/paper/Layer-Normalization-Ba-Kiros/97fb4e3d45bb098e27e0071448b6152217bd35a5.

20. 训练中loss不收敛的情况如何解决？梯度消失和梯度爆炸是什么？如何解决？交叉熵的某些batch loss很大，可能是什么原因？
> 训练中loss不收敛的情况可能有以下几种解决方法³⁴：
>1. 保持需要的batchsize不变，或考虑调整batch size大小。
>2. 查看是否有梯度回传。
>3. 查看数据是否有问题，如标签错乱，归一化等。
>4. 调节学习率，从大向小调，建议每次除以5。
>
> 梯度消失和梯度爆炸是指在神经网络反向传播时，由于链式求导法则的累乘效应，导致某些参数的梯度变得非常小或非常大的问题⁵。梯度消失会使得靠近输入层的权值更新缓慢或停滞，梯度爆炸会使得模型不稳定，损失函数震荡或变成NaN⁵。
>
> 解决梯度消失和梯度爆炸的方法包括⁷[^10^]：
>1. 预训练和fine-tuning：将一些在公开训练集上训练好的模型参数加载到自己对应的模型中，这样损失函数通常就能稳定的优化。
>2. 梯度裁剪：梯度裁剪是一个针对梯度爆炸的解决方案，也就是说将梯度限制在某个阈值范围内，如果梯度超过的这个阈值，那么就将其设置为这个阈值。
>3. BatchNorm：通过对每一层的输出规范为均值和方差一致的方法，消除了X带来的放大缩小的影响，进而解决梯度消失和爆炸的问题。
>
> 交叉熵的某些batch loss很大，可能的原因包括¹⁴¹⁵¹⁶：
>1. 学习率过大，导致loss出现震荡。
>2. 损失函数有一些梯度非常大的地方，一到那里就会飞出去。
>3. 训练集打散程度不够，另外shuffle的buffersize比较小，每个epoch开始的一个batch接近原来序。
>4. 训练代码有问题。
>
> 希望这些信息对您有所帮助！如果您还有其他问题，欢迎随时向我提问。
>
> 源: 与必应的对话， 2023/11/30
(1) loss不收敛可能的原因以及相应的解决方法 - CSDN博客. https://blog.csdn.net/pearl8899/article/details/108110179.
(2) 总结一些loss不收敛的解决方法_-log损失函数训练不收敛_print_lzp的博客-CSDN博客. https://blog.csdn.net/print_lzp/article/details/121139876.
(3) 【深度学习基础知识 - 03】梯度消失和梯度爆炸的概念及解决方案_什么是梯度消失_雁宇up的博客-CSDN博客. https://blog.csdn.net/yanyuxiangtoday/article/details/119789602.
(4) . https://bing.com/search?q=%e6%a2%af%e5%ba%a6%e6%b6%88%e5%a4%b1%e5%92%8c%e6%a2%af%e5%ba%a6%e7%88%86%e7%82%b8%e5%a6%82%e4%bd%95%e8%a7%a3%e5%86%b3.
(5) 深度学习中梯度消失和梯度爆炸的根本原因及其缓解方法_什么是梯度消失-CSDN博客. https://blog.csdn.net/weixin_46470894/article/details/107145207.
(6) loss周期性地上升下降，这是由什么引起的？ - 知乎. https://www.zhihu.com/question/425405438.
(7) 警惕！损失Loss为Nan或者超级大的原因 - CSDN博客. https://blog.csdn.net/lrt366/article/details/97616926.
(8) Pytorch训练模型损失Loss为Nan或者无穷大（INF）原因_pytorch loss nan_ytusdc的博客-CSDN博客. https://blog.csdn.net/ytusdc/article/details/122321907.
(9) loss问题汇总（不收敛、震荡、nan） - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/420053831.
(10) 神经网络训练过程中不收敛或者训练失败的原因 - 知乎. https://zhuanlan.zhihu.com/p/285601835.
(11) . https://bing.com/search?q=%e6%a2%af%e5%ba%a6%e6%b6%88%e5%a4%b1%e5%92%8c%e6%a2%af%e5%ba%a6%e7%88%86%e7%82%b8%e6%98%af%e4%bb%80%e4%b9%88.
(12) 梯度爆炸与梯度消失是什么？有什么影响？如何解决？_梯度爆炸和梯度消失-CSDN博客. https://blog.csdn.net/ftimes/article/details/105837637.
(13) 详解深度学习中的梯度消失、爆炸原因及其解决方法 - 知乎. https://zhuanlan.zhihu.com/p/33006526.
(14) 算法工程师面试（六）：梯度消失与梯度爆炸 - 知乎. https://zhuanlan.zhihu.com/p/421848334.
(15) 梯度消失和梯度爆炸及解决方法 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/72589432.
(16) torch loss（ctc、cross_entropy）损失引起的梯度爆炸、inf与nan - 知乎. https://zhuanlan.zhihu.com/p/397310269.
(17) undefined. https://www.zhihu.com/question/290392414.
(18) undefined. https://zhuanlan.zhihu.com/p/321418207.
(19) undefined. https://zhuanlan.zhihu.com/p/33006526?from_voters_page=true.
(20) undefined. https://www.zhihu.com/question/408567113.

21. 如何缓解模型过拟合？请给出尽量多样的解决方法
> 模型过拟合是机器学习中常见的问题，以下是一些常用的解决方法¹²³⁴：
>
> 1. **增加训练数据集**：更多的数据可以提供更多的信息，帮助模型更好地学习和泛化¹。
>
> 2. **数据增强**：通过一定规则来扩充数据，比如旋转、平移、缩放、改变亮度、添加噪声等⁵。
>
> 3. **使用简单模型**：复杂的模型更容易过拟合，使用简单模型可以降低过拟合的风险⁴。
>
> 4. **正则化**：正则化是一种用于防止过拟合的技术，它通过在损失函数中添加一个正则项（如L1或L2正则项）来限制模型的复杂性¹。
>
> 5. **Dropout**：Dropout是一种在神经网络中常用的正则化技术，它在训练过程中随机忽略一部分神经元，防止模型过度依赖某些特定的神经元³。
>
> 6. **早停法（Early Stopping）**：在训练过程中，当验证误差开始增加时，我们应该停止训练模型，这样就能阻止过拟合¹。
>
> 7. **使用验证集（Holdout Method）**：将数据集划分为训练集和验证集，训练集用于训练模型，验证集用于调整模型参数和防止过拟合¹。
>
> 8. **交叉验证**：交叉验证是一种评估模型泛化性能的统计学方法，它更全面地使用了数据，可以有效防止过拟合¹。
>
> 9. **集成学习**：集成学习是一种机器学习范式，它结合了多个模型的预测结果，以获得更好的性能¹。
>
> 10. **特征选择**：通过选择最具预测性或相关性的特征来减少模型复杂度和提高模型泛化能力¹。
>
> 以上就是一些常用的解决过拟合的方法，具体的选择需要根据具体的模型和任务进行调整。希望这个回答对你有所帮助！
>
> 源: 与必应的对话， 2023/11/30
(1) 10招解决机器学习模型过拟合问题 - 知乎 - 知乎专栏. https://bing.com/search?q=%e5%a6%82%e4%bd%95%e7%bc%93%e8%a7%a3%e6%a8%a1%e5%9e%8b%e8%bf%87%e6%8b%9f%e5%90%88%e7%9a%84%e8%a7%a3%e5%86%b3%e6%96%b9%e6%b3%95.
(2) 缓解机器学习模型过拟合的13种方法 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/622943295.
(3) 14. 过拟合(overfitting)与解决办法 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/266658432.
(4) 六种方法帮你解决模型过拟合问题-腾讯云开发者社区-腾讯云. https://cloud.tencent.com/developer/article/1969496.
(5) 深度学习中“过拟合”的产生原因和解决方法 - 凌逆战 - 博客园. https://www.cnblogs.com/LXP-Never/p/13755354.html.
(6) 如何解决机器学习模型过拟合 | 6个必备技巧 - 知乎. https://zhuanlan.zhihu.com/p/139652187.

22. 介绍一些推荐系统算法和该领域最新的论文成果
> 推荐系统算法主要有以下几种¹²³⁴：
>
> 1. **基于行为的协同过滤**：该算法分为基于用户的协同推荐和基于项目的协同推荐。它通过收集用户历史数据来获取与用户有过交互的项目，然后根据这些项目的特征来学习计算出用户的偏好兴趣。
>
> 2. **基于内容的推荐**：通过收集用户历史数据来获取与用户有过交互的项目，再根据这些项目的特征来学习计算出用户的偏好兴趣，然后以此为基础计算用户与待推荐项目集中各个项目的相似度，最后将相似度进行排序整理，进而为用户进行推荐。
>
> 3. **基于关联规则推荐**：从大量的用户行为数据中抽取潜在有用的关联规则，向用户推荐其感兴趣的项目。
>
> 4. **基于知识推荐**：基于知识的推荐技术，首先要预置用户知识和项目知识，然后在明确用户需求的基础上进行推荐。
>
> 5. **基于上下文的推荐**：大多数推荐系统都是研究和处理用户和项目之间的二元关系，而忽略了时间、地点、周围人等上下文信息。
>
> 6. **基于深度学习的推荐**：利用深度学习模型，如神经网络，来提取和学习用户和项目的深层特征，以提高推荐的准确性和个性化程度。
>
> 关于推荐系统领域的最新论文成果，我找到了一些相关的信息⁶⁷。这些论文涵盖了SIGIR2020, KDD2020, RecSys2020, CIKM2020, AAAI2021, WSDM2021, WWW2021等多个会议，包括了协同过滤、序列推荐、知识感知推荐、对话推荐系统、社交推荐、新闻推荐、文本感知推荐、兴趣点推荐、在线推荐、组推荐、多任务/多行为/跨域推荐等多个任务，以及去偏、公平性、攻击、可解释性、长尾/冷启动问题、评价和实验分析等多个热门研究话题。具体的论文列表和详细内容，你可以查看这些参考链接⁶⁷。
>
> 以上是我对推荐系统算法和该领域最新的论文成果的介绍，如果你需要更多的信息或者有其他问题，欢迎随时向我提问。
>
> 源: 与必应的对话， 2023/11/30
(1) . https://bing.com/search?q=%e6%8e%a8%e8%8d%90%e7%b3%bb%e7%bb%9f%e7%ae%97%e6%b3%95%e4%bb%8b%e7%bb%8d.
(2) 推荐系统概述和主流模型介绍 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/379721725.
(3) 推荐系统[一]：超详细知识介绍，一份完整的入门指南 - 知乎. https://zhuanlan.zhihu.com/p/608111175.
(4) 推荐系统常用算法总结（适合刚入门的同学） - 腾讯云. https://cloud.tencent.com/developer/article/1614209.
(5) 从200多篇顶会论文看推荐系统前沿方向与最新进展 - 知乎. https://zhuanlan.zhihu.com/p/361341288?utm_oi=26966728114176.
(6) 800 篇顶会论文纵览推荐系统的前沿进展 - 知乎. https://zhuanlan.zhihu.com/p/585945102.
(7) 从理论到实践，一文详解 AI 推荐系统的三大算法-阿里云开发者社区. https://developer.aliyun.com/article/177394.
(8) WWW2023 | 76篇推荐系统相关论文 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/615576677.
(9) 15篇推荐系统领域最新研究进展汇总 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/660388536.
(10) 2020年搜索推荐系统论文干货集锦 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/341581547.
(11) undefined. https://zhuanlan.zhihu.com/p/207038540.
(12) undefined. https://zhuanlan.zhihu.com/p/100813651.
(13) undefined. https://www2023.thewebconf.org/program/accepted-papers.

23. 如何对用户做兴趣探索？物品冷启动和用户冷启动如何做？
> 对用户进行兴趣探索和处理物品冷启动、用户冷启动的问题，可以参考以下的一些策略：
>
> **用户兴趣探索**¹⁴：
>1. **Attribute level**：挖掘目标间的相似属性，推荐同一类别的目标。例如，如果一个用户喜欢买红色、大尺寸的诺基亚手机，可以试着给用户推荐黑色、小尺寸的其他手机。
>2. **Type level**：挖掘目标间的相似属性，然后推荐相同大品类下不同小品类的物品。例如，如果用户喜欢红色、大尺寸的诺基亚手机，可以推荐红色、大尺寸的电脑给用户。
>3. **Item level**：挖掘目标间的相似属性，推荐不同大品类的物品。例如，如果用户喜欢红色、大尺寸的诺基亚手机，可以直接推荐红色大尺寸的马桶。
>
> **物品冷启动**[^10^]：
>
>1. **利用物品的metadata信息做推荐**：物品的metadata信息是我们了解物品最好的媒介，基于metadata信息可以方便地解决物品冷启动问题。
>2. **采用快速试探策略**：另外一种思路是借用强化学习中的EE (Exploration-Exploitation)思想，将新物品曝光给随机一批用户，观察用户对物品的反馈，找到对该物品有正向反馈的用户，后续将该物品推荐给有正向反馈的用户或者与该用户相似的用户。
>3. **采用基于关系传递的策略**：当产品在拓展物品品类的过程中，比如视频类应用，前期只做长视频，后来拓展到短视频，那么对某些没有短视频观看行为的用户，怎么给他做短视频推荐呢？
>
>**用户冷启动**⁵⁶⁷⁸：
>1. **提供非个性化的推荐**：利用先验数据做推荐（新热标的物品）、给用户提供多样化的选择（每个大类各出一项）。
>2. **利用新用户在注册时提供的信息**：人口统计学数据、社交关系、用户填写的兴趣点等。
>
>以上只是一些基本的策略，具体的实施还需要根据你的业务需求和用户特性进行调整。希望这些信息对你有所帮助！
>
>源: 与必应的对话， 2023/11/30
(1) 推荐系统之兴趣探索（Exploration&Exploitation） - 知乎. https://bing.com/search?q=%e5%a6%82%e4%bd%95%e5%af%b9%e7%94%a8%e6%88%b7%e5%81%9a%e5%85%b4%e8%b6%a3%e6%8e%a2%e7%b4%a2.
(2) CTR 预测理论（二十三）：推荐系统用户兴趣特征表征方式_推荐系统中,兴趣通过什么来体现呢-CSDN博客. https://blog.csdn.net/dby_freedom/article/details/103929882.
(3) . https://bing.com/search?q=%e7%89%a9%e5%93%81%e5%86%b7%e5%90%af%e5%8a%a8%e5%a6%82%e4%bd%95%e5%81%9a.
(4) 用户冷启动怎么做，才能实现产品爆发式增长 | 人人都是产品经理. https://www.woshipm.com/operate/578463.html.
(5) 冷启动：如何找到你的1000位用户 | 人人都是产品经理. https://www.woshipm.com/operate/4613374.html.
(6) 推荐基础-冷启动 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/352971584.
(7) 机器学习：聊聊推荐系统中用户冷启动问题 - 知乎. https://zhuanlan.zhihu.com/p/31202640.
(8) 如何做优秀的产品：围绕用户的兴趣点 | 人人都是产品经理. https://www.woshipm.com/pmd/592036.html.
(9) 推荐系统之兴趣探索（Exploration&Exploitation） - 知乎. https://zhuanlan.zhihu.com/p/108182368.
(10) 用户冷启动策略-CSDN博客. https://blog.csdn.net/weixin_39586997/article/details/120590202.
(11) 推荐系统资源（物品）冷启动的方法都有哪些？ - 知乎. https://www.zhihu.com/question/489909890.
(12) 《推荐系统》系列之三：一文读懂冷启动推荐 - 知乎. https://zhuanlan.zhihu.com/p/376798647.
(13) 【推荐系统实践-03】推荐系统冷启动 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/100296281.
(14) undefined. https://zhuanlan.zhihu.com/p/79950668.

24. 为什么激活函数常使用sigmoid函数？
>Sigmoid函数是一种常用的激活函数，主要有以下几个原因¹²³：
>
>1. **输出范围**：Sigmoid函数的输出范围在(0,1)之间，这使得它可以将任何实数映射到这个区间内，可以用来做二分类¹。
>
>2. **非线性**：Sigmoid函数是一个非线性函数，这使得神经网络可以逼近其他的任何非线性函数，这样可以使得神经网络应用到更多非线性模型中¹。
>
>3. **连续并可导**：Sigmoid函数是连续的，并且在其定义域内可导。这个性质使得Sigmoid函数可以被优化算法（如梯度下降）有效地使用¹。
>
>4. **易于计算**：Sigmoid函数及其导数的计算相对简单¹。
>
>然而，Sigmoid函数也存在一些问题，如梯度消失、计算成本高、输出不以零为中心等²³。因此，在某些情况下，可能会选择其他的激活函数，如ReLU、tanh等²³。希望这个回答对你有所帮助！
>
>源: 与必应的对话， 2023/11/30
(1) . https://bing.com/search?q=%e4%b8%ba%e4%bb%80%e4%b9%88%e6%bf%80%e6%b4%bb%e5%87%bd%e6%95%b0%e5%b8%b8%e4%bd%bf%e7%94%a8sigmoid%e5%87%bd%e6%95%b0.
(2) 深度学习笔记：如何理解激活函数？（附常用激活函数） - 知乎. https://zhuanlan.zhihu.com/p/364620596.
(3) 详解激活函数（Sigmoid/Tanh/ReLU/Leaky ReLu等） - 知乎专栏. https://zhuanlan.zhihu.com/p/427541517.
(4) 大白话深度学习中的Sigmoid函数 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/424858561.
(5) 机器学习中的数学——激活函数（一）：Sigmoid函数_von Neumann的博客-CSDN博客. https://blog.csdn.net/hy592070616/article/details/120617176.
(6) undefined. https://www.quora.com/What-is-the-sigmoid-process.
(7) undefined. https://www.engati.com/glossary/sigmoid-function.
(8) undefined. https://www.healthline.com/health/digestive-health/sigmoid-colon.
(9) undefined. https://www.linkedin.com/pulse/sigmoid-curve-model-constant-business-growth-innovation-mba.

25. batch normalization有什么优缺点？怎么调整？(从bn的两个参数角度出发)
>Batch Normalization（BN）是一种在深度学习中常用的技术，它有一些显著的优点，但也存在一些缺点⁶⁷⁸⁹。
>
>**优点**：
>1. **加速收敛**：BN可以使深度神经网络的训练速度更快，因为它可以减少内部协变量偏移，使得每一层的输入分布更稳定⁶⁷⁸。
>2. **降低初始权重的重要性**：BN可以减少对初始权重选择的敏感性⁸。
>3. **鲁棒的超参数**：BN可以使模型对超参数的选择更鲁棒⁸。
>4. **需要更少的数据泛化**：BN可以使模型在较少的数据上也能达到良好的泛化性能⁸。
>
>**缺点**：
>1. **小批量效果差**：当批量大小较小时，BN的效果可能会变差，因为BN是使用整个批次中样本的均值和方差来模拟全部数据的均值和方差，所以当批次大小较小时，这种模拟可能会不准确⁶⁷⁸⁹。
>2. **在RNN中效果差**：BN在循环神经网络（RNN）中的效果可能会比较差⁶⁷⁸⁹。
>
>**如何调整BN的参数**¹²³⁴⁵：
>BN有两个可训练的参数，即缩放参数（γ）和偏移参数（β）。这两个参数在训练过程中会被更新。在BN的过程中，首先会对输入进行标准化，使得输入的均值为0，方差为1。然后，会对标准化后的输入进行缩放和偏移，即乘以γ并加上β。这样，BN可以在保持数据标准化的同时，通过调整γ和β来适应模型的需要。
>
>在训练阶段，BN会使用当前批次的均值和方差进行标准化；在推理（或测试）阶段，BN会使用在训练阶段计算得到的移动平均均值和方差进行标准化¹²³⁴⁵。
>
>希望这个回答对你有所帮助！如果你有其他问题，欢迎随时向我提问。
>
>源: 与必应的对话， 2023/11/30
(1) BN踩坑记--谈一下Batch Normalization的优缺点和适用场景 - 知乎. https://zhuanlan.zhihu.com/p/152288153.
(2) 深度学习中 Batch Normalization为什么效果好？ - 知乎. https://www.zhihu.com/question/38102762.
(3) 【精选】解读batch normalization的优缺点-CSDN博客. https://blog.csdn.net/weixin_45074568/article/details/123153624.
(4) BN踩坑记--谈一下Batch Normalization的优缺点和适用场景-CSDN博客. https://blog.csdn.net/DeepLearning_/article/details/133986639.
(5) 【基础算法】六问透彻理解BN(Batch Normalization） - 知乎. https://zhuanlan.zhihu.com/p/93643523.
(6) 通俗理解 Batch Normalization（含代码） - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/609131550.
(7) Batch Normalization及其作用 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/615133675.
(8) 不论是训练还是部署都会让你踩坑的Batch Normalization - 知乎. https://zhuanlan.zhihu.com/p/388730276.
(9) 批标准化 tf.keras.layers.BatchNormalization 参数解析与应用分析-CSDN博客. https://blog.csdn.net/Strive_For_Future/article/details/108375682.
(10) undefined. http://jmlr.org/proceedings/papers/v37/ioffe15.pdf.

26. GPT2、GPT3、Bert、llama的训练目标和损失函数有什么区别？下游任务有什么区别？
>GPT2、GPT3、Bert、llama这四种模型都是预训练语言模型，它们的训练目标和损失函数有一些区别¹²⁴。
>
>**GPT2和GPT3**：
> - GPT2和GPT3是由OpenAI提出的预训练语言模型，它们的训练目标是通过在无标签的数据上学习一个生成式的语言模型²。
> - GPT2和GPT3的训练过程分为无监督的预训练和有监督的模型微调两部分²。
> - 在无监督预训练阶段，GPT2和GPT3会学习到大量的语言知识，如词汇、语法、句子结构等²。
> - 在有监督微调阶段，GPT2和GPT3会根据特定任务的需要来学习相关的知识²。
>
>**Bert**：
> - Bert是由Google AI Language团队提出的预训练语言模型¹。
> - Bert的训练目标是通过在大量的文本上训练语言模型，使得模型具有足够的语言能力来处理各种不同的自然语言任务¹。
> - Bert的训练过程也分为预训练和微调两部分¹。
> - 在预训练阶段，Bert模型会学习到大量的语言知识，如词汇、语法、句子结构等¹。
> - 在微调过程中，Bert会使用更小的标记数据来调整模型参数，使得模型更适合特定的任务¹。
>
>**Llama**：
> - Llama的特点是它专门训练于公开可获得的数据集，使其对研究人员和开发人员更加可用³。
> - 尽管仅在相对较小数据集上进行训练，它依然实现了有竞争力的结果³。
>
> 在下游任务方面，GPT2和GPT3主要用于文本生成，如文本自动完成、对话生成、文章摘要等²。而Bert主要用于自然语言理解，如问答系统、句子相似度比较、文本分类、情感分析、命名实体识别等¹。Llama的下游任务则需要进一步查找相关资料。
>
> 希望这个回答对你有所帮助！如果你有其他问题，欢迎随时向我提问。
>
>源: 与必应的对话， 2023/11/30
(1) 关于ChatGPT：GPT和BERT的差别（易懂版） - 知乎专栏. https://zhuanlan.zhihu.com/p/607605399.
(2) 预训练语言模型之GPT-1，GPT-2和GPT-3 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/350017443.
(3) OpenAI GPT 和 GPT2 模型详解 - 简书. https://www.jianshu.com/p/da619f625668.
(4) 技术|Llama 2 vs GPT-4：有何区别？ - Linux 中国. https://linux.cn/article-16030-1.html.
(5) Llama 2 vs GPT-4：有何区别？ | Linux 中国 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/645661557.
(6) GPT综述-各模型之间的对比 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/450074465.

27. Transformer的编码器和解码器在计算attention上有什么不同？
>在Transformer模型中，编码器和解码器在计算attention时有一些区别¹²³。
>
>**编码器**：编码器中的自注意力机制（Self-Attention）会考虑输入序列中的所有位置，对于每一个位置，都会计算其与序列中其他位置的关系，然后根据这些关系来更新该位置的表示¹²。
>
>**解码器**：解码器中也有自注意力机制，但是由于解码过程是自回归的，也就是说，每一步的输出依赖于前一步的输出，因此在计算attention时，解码器需要防止看到未来的信息。这是通过在self-attention层中加入一个掩码（Mask）来实现的，使得每个位置只能关注到其之前的位置¹²。
>
>此外，解码器还有一个编码器-解码器注意力层（Encoder-Decoder Attention），它允许每个位置在解码器中关注到编码器输出的所有位置。这样，解码器可以利用输入序列的信息¹²。
>
>总的来说，编码器和解码器在计算attention时的主要区别在于，解码器在自注意力机制中使用了掩码来防止看到未来的信息，并且解码器增加了一个额外的注意力层来关注编码器的输出¹²³。希望这个回答对你有所帮助！如果你有其他问题，欢迎随时向我提问。
>
> 源: 与必应的对话， 2023/11/30
(1) 一文读懂Transformer和Attention - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/90033981.
(2) 解码Transformer：自注意力机制与编解码器机制详述与代码实现 - 知乎. https://zhuanlan.zhihu.com/p/649661692.
(3) 【原创】深入浅出Attention和Transformer-CSDN博客. https://blog.csdn.net/u010567574/article/details/109500559.
(4) Transformer模型详解（图解最完整版） - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/338817680.
(5) 【经典精读】万字长文解读Transformer模型和Attention机制 - 知乎. https://zhuanlan.zhihu.com/p/104393915.

28. Transformer的参数量如何计算？时间复杂度如何？相比LSTM和RNN的优势在哪？为什么用LN而不用BN？为什么要用残差连接？
> 好的，我来一一解答你的问题：
>
> **Transformer的参数量如何计算？**
> Transformer模型的参数量计算可以通过以下公式来进行⁵：
> - 输入嵌入层：假设输入嵌入层的维度为d_model，词表大小为V，那么参数数量为d_model * V。
> - 编码器层：假设Transformer模型有N个编码器层，每个编码器层包含多头自注意力机制和前馈神经网络。多头自注意力机制中，假设注意力头数为h，隐藏层维度为d_model，则参数数量为4 * d_model^2 * h。前馈神经网络中，假设隐藏层维度为d_ff，则参数数量为2 * d_model * d_ff。
> - 解码器层：与编码器层类似，假设Transformer模型有N个解码器层，每个解码器层包含多头自注意力机制、多头编码器-解码器注意力机制和前馈神经网络。注意力机制中的参数数量与编码器层相同。
> - 输出层：假设输出层的维度为d_model，词表大小为V，那么参数数量为d_model * V。
>
> **Transformer的时间复杂度如何？**
> 对于一个具有L个层的Transformer模型，其时间复杂度为O(LN^2H)，其中N^2来自于注意力机制的计算¹⁵。
>
> **相比LSTM和RNN的优势在哪？**
> Transformer模型相较于RNN和LSTM，它具有以下优势¹⁸：
>
> 并行计算：RNN和LSTM需要顺序处理序列数据，因此很难进行并行计算。而Transformer的自注意力机制允许同时处理整个序列，从而可以充分利用GPU的并行计算能力，大大提高模型训练和推理的速度。
>
> **为什么用LN而不用BN？**
> BN是对一批数据进行归一化，一批里有不同的样本，bn对不同样本的同一个通道的特征（channel）进行均值方差操作；而LN对同一个样本内部的不同特征进行均值方差操作[^10^]。LN可以不受样本数的限制，特别适合处理变长数据，因为是对channel维度做操作，和句子长度和batch大小无关¹¹。
>
> **为什么要用残差连接？**
> 在Transformer模型中，残差连接是一种特殊的连接方式，用于在深层网络中传递信息和缓解梯度消失的问题。该连接将输入添加到每个子层的输出上，使得网络可以直接学习原始输入的表示。这样做的好处是可以更好地保留输入的信息，减轻网络的训练负担，并提高模型的性能¹。
>
>希望这些信息能够帮助你理解Transformer模型的相关知识。如果你还有其他问题，欢迎随时向我提问。
>
>源: 与必应的对话， 2023/11/30
(1) . https://bing.com/search?q=Transformer%e7%9a%84%e5%8f%82%e6%95%b0%e9%87%8f%e5%a6%82%e4%bd%95%e8%ae%a1%e7%ae%97.
(2) Transformer模型的时间复杂度 - CSDN博客. https://blog.csdn.net/shdabai/article/details/130500320.
(3) Transformer相比RNN和LSTM有哪些优势？ - 掘金. https://juejin.cn/post/7240636255972819000.
(4) 为啥用LN而不用BN在Transformer里 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/459654024.
(5) 为什么Transformer要用LayerNorm？ - 知乎. https://www.zhihu.com/question/487766088.
(6) transformer残差连接 - CSDN文库. https://bing.com/search?q=%e4%b8%ba%e4%bb%80%e4%b9%88Transformer%e8%a6%81%e7%94%a8%e6%ae%8b%e5%b7%ae%e8%bf%9e%e6%8e%a5.
(7) transfomer的组成-残差连接和层归一化 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/422247863.
(8) Transformer学习笔记四：ResNet（残差网络） - 知乎. https://zhuanlan.zhihu.com/p/459065530.
(9) transformer残差连接 - CSDN文库. https://wenku.csdn.net/answer/4thwsc1079.
(10) 分析transformer模型的参数量、计算量、中间激活、KV cache - 知乎. https://zhuanlan.zhihu.com/p/624740065.
(11) Transformer 101 (一): 参数量和时间空间复杂度 - 知乎. https://zhuanlan.zhihu.com/p/661804092.
(12) transformer参数量计算 - CSDN文库. https://wenku.csdn.net/answer/37f90e8f13b744ee98114879a877c5c7.
(13) Transformer 相关模型的参数量计算 - CSDN博客. https://blog.csdn.net/beingstrong/article/details/132383758.
(14) Transformer中的归一化(五)：Layer Norm的原理和实现 & 为什么Transformer要用LayerNorm. https://zhuanlan.zhihu.com/p/492803886.
(15) Transformer/CNN/RNN的对比（时间复杂度，序列操作数，最大路径长度） - 知乎. https://zhuanlan.zhihu.com/p/264749298.
(16) 降低Transformer复杂度O(N^2)的方法汇总（一） - 知乎专栏. https://zhuanlan.zhihu.com/p/634406691.
(17) Transformer的时间和空间复杂度分析 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/660311169.
(18) RNN、LSTM与Transformer的算理区别（一） - 知乎专栏. https://zhuanlan.zhihu.com/p/463340021.
(19) 【转】RNN、LSTM、Transformer、BERT简介与区别-CSDN博客. https://blog.csdn.net/qq_35222729/article/details/119737612.
(20) CNN/RNN/Transformer对比 - 知乎. https://zhuanlan.zhihu.com/p/615000678.
(21) undefined. https://zhuanlan.zhihu.com/p/630582034.
(22) undefined. http://karpathy.github.io/2015/05/21/rnn-effectiveness/%29.

29. BiLSTM耗时是LSTM的两倍吗？两个LSTM可以同时进行吗？介绍一下LSTM三个门结构、遗忘门的所有输入。LSTM的输入一般是什么格式？常见的LSTM是如何处理词的？
>关于您的问题，我会逐一回答。
>
>首先，BiLSTM（双向长短期记忆网络）的计算时间并不一定是LSTM的两倍。虽然BiLSTM包含两个LSTM，一个处理正向序列，另一个处理反向序列，但这两个LSTM可以并行计算，因此，如果硬件允许并行计算，BiLSTM的计算时间可能接近于单个LSTM。
>
>LSTM的三个门结构包括输入门、遗忘门和输出门。遗忘门的输入包括当前输入$x_t$和上一时刻的隐藏状态$h_{t-1}$，通过一个sigmoid函数，生成一个介于0和1之间的值，用于决定哪些信息应该被遗忘。
>
>LSTM的输入通常是一个序列，其中每个元素都是一个向量。例如，在自然语言处理中，一个句子可以被表示为一个词向量序列，其中每个词向量可能是一个one-hot向量或者是一个嵌入向量。
>
>在处理词的时候，LSTM通常首先将每个词转换为一个向量（例如，使用词嵌入技术如Word2Vec或GloVe），然后将这些向量作为序列输入到LSTM中。LSTM会根据这些输入和其内部状态，逐步更新其隐藏状态，从而捕获序列中的模式和依赖关系。最后，这些隐藏状态可以用于各种任务，如分类、生成等。希望这些信息对您有所帮助！

30. seq2seq输出序列是串行还是并行？输出时的词是怎么得到的？BiLSTM/seq怎么算attention?
>关于您的问题，我会逐一回答。
>
>首先，seq2seq模型的输出序列通常是串行生成的。在解码阶段，模型会根据已经生成的部分序列和编码器的输出，生成下一个输出。这个过程会重复，直到生成一个特殊的结束符号或达到最大长度。
>
>在seq2seq模型中，输出的词是通过在每个时间步应用一个softmax函数到解码器的输出上得到的。这个softmax函数会给出每个可能的输出词的概率，然后我们可以选择概率最高的词作为输出。
>
>至于attention机制，它是一种让模型在生成每个输出词时，能够参考输入序列中所有位置的信息的方法。在BiLSTM或seq2seq模型中，attention通常是通过计算解码器当前隐藏状态和编码器所有隐藏状态的相似度得到的。这些相似度被视为权重，然后用于对编码器的隐藏状态进行加权平均，得到一个上下文向量。这个上下文向量然后被用于生成解码器的下一个输出。希望这些信息对您有所帮助！


31. BiLSTM如果输入序列是变长，怎么处理？
>对于变长的输入序列，BiLSTM通常采用填充（padding）和打包（packing）的方法来处理。
>
>**填充**是指将所有序列填充到相同的长度，通常是在较短的序列后面添加一个特殊的填充符号，使其长度与最长的序列相等。这样，所有序列都可以被整齐地组织在一起，形成一个批次，以便进行并行计算。
>
>然而，填充会带来一个问题，那就是模型可能会将填充符号作为有效的输入来处理。为了解决这个问题，我们通常会使用**打包**。打包是一种让模型知道哪些输入是实际的输入，哪些是填充的方法。在PyTorch中，例如，我们可以使用`pack_padded_sequence`和`pad_packed_sequence`函数来实现打包和解包。
>
>通过这种方式，BiLSTM可以有效地处理变长的输入序列，而不会被填充符号干扰。希望这个答案对您有所帮助！

32. 如果只用全连接层，怎么捕捉上下文？word2vec有没有用到上下文？
>对于您的问题，我会逐一回答。
>
>首先，全连接层（Fully Connected Layer，FC）通常不直接用于捕捉上下文信息。因为FC层处理的是独立的输入，它并不能直接捕捉到输入之间的顺序关系。然而，我们可以通过一些技巧来让FC层能够处理上下文信息。例如，我们可以将一个窗口内的多个输入向量拼接起来，然后作为FC层的输入。这样，FC层就可以同时看到窗口内的所有输入，从而捕捉到一定的上下文信息。但是，这种方法的缺点是窗口大小固定，不能捕捉到更大范围的上下文信息。
>
>至于Word2Vec，它确实使用了上下文信息。Word2Vec有两种主要的训练方法：CBOW和Skip-gram。CBOW方法预测的是中心词，给定的是上下文；Skip-gram方法预测的是上下文，给定的是中心词。在这两种方法中，上下文都被用来提供预测的信息，因此，我们可以说Word2Vec是利用了上下文信息的。希望这些信息对您有所帮助！

33. 介绍一下big gram编码。有没有三元的编码?跟big gram有什么区别？
>关于您的问题，我会逐一回答。
>
>首先，bigram编码，也称为二元编码，是一种在自然语言处理中常用的技术。在bigram编码中，我们考虑的是两个相邻的元素（通常是单词或字符）。例如，在句子“我爱北京天安门”中，bigrams包括“我爱”，“爱北京”，“北京天”，“天安”，“安门”。
>
>其次，确实存在三元编码，也称为trigram编码。在trigram编码中，我们考虑的是三个相邻的元素。例如，在同样的句子“我爱北京天安门”中，trigrams包括“我爱北京”，“爱北京天”，“北京天安”，“天安门”。
>
>bigram和trigram的主要区别在于它们考虑的元素数量。bigram考虑两个相邻的元素，而trigram考虑三个。因此，trigram可以捕捉到更复杂的模式，但同时也可能会增加模型的复杂性和计算需求。希望这些信息对您有所帮助！

34. bert相比BiLSTM有什么优势？
>关于您的问题，我会逐一回答。
>
>BERT和BiLSTM都是自然语言处理中常用的模型，但它们有一些重要的区别，这些区别使得BERT在许多任务上具有优势⁴。
>
>首先，BERT使用了Transformer架构，而BiLSTM使用的是LSTM架构。Transformer的优势在于它可以并行处理序列中的所有元素，而LSTM则需要按顺序处理每个元素。这使得BERT在处理长序列时更加高效⁴。
>
>其次，BERT是一个深度双向模型。这意味着BERT在处理每个词时，都会考虑到它的上下文信息，包括它前面和后面的词。而BiLSTM虽然也可以处理上下文信息，但它通常只考虑一个方向的上下文（即前向或后向）。这使得BERT能够更好地理解语言的复杂性和歧义性⁴。
>
>然而，也有一些研究表明，对于一些小数据集，BiLSTM模型可能会比BERT模型表现得更好¹。这是因为BERT模型的参数量非常大，需要大量的数据来避免过拟合。而BiLSTM模型则相对较小，更适合小数据集¹。
>
>总的来说，BERT和BiLSTM各有优势，适用于不同的任务和数据集。希望这个答案对您有所帮助！
>
>源: 与必应的对话， 2023/11/30
(1) What are some key strengths of BERT over ELMO/ULMFiT?. https://datascience.stackexchange.com/questions/68155/what-are-some-key-strengths-of-bert-over-elmo-ulmfit.
(2) [2009.05451] A Comparison of LSTM and BERT for Small Corpus - arXiv.org. https://arxiv.org/abs/2009.05451.
(3) . https://bing.com/search?q=BERT+vs+BiLSTM+advantages.
(4) Is a BiLSTM layer required if we use BERT?. https://datascience.stackexchange.com/questions/87571/is-a-bilstm-layer-required-if-we-use-bert.
(5) undefined. https://ieeexplore.ieee.org/document/9498209.
(6) undefined. https://www.cambridge.org/core/journals/natural-language-engineering/article/constrained-bert-bilstm-crf-for-understanding-multisentence-entityseeking-questions/891F2A9DAD6642A17D8B67523EC45316.
(7) undefined. https://arxiv.org/pdf/2102.10934.

35. bert是串行还是并行输出？直接并行输出可以实现吗？效果会比串行更好吗？
> BERT模型的输出是基于序列的，也就是说，它处理的输入是一个序列，输出也是一个序列⁶。这是因为BERT模型的核心架构是Transformer，它在传统的RNN的串行基础上引入了并行，以加快运算速度⁶。
>
>至于是否可以直接并行输出，这需要考虑到模型的设计和目标。例如，英伟达在训练世界上最大的基于Transformer的语言模型GPT-2 8B时，使用了原生PyTorch进行训练，在512个GPU上实现了8路模型并行和64路数据并行³。然而，这并不意味着并行总是优于串行。实际上，当时钟频率提高到一定程度时，由于并行导线之间的相互干扰变得越来越严重，传输的数据可能已经无法恢复¹¹。
>
>关于并行输出是否会比串行更好，这取决于具体的应用场景和任务。在某些情况下，如资源充足的情况下，利用并行计算的Transformer可能会比LSTM快很多¹²。然而，并不是所有的任务都会从并行处理中受益。例如，BERT本身可能并不适合某些自然语言生成（NLG）任务⁴。此外，对于同样的数据集，BERT可能会比LSTM表现得更好¹³，但这并不意味着并行总是优于串行。
>
> 总的来说，是否选择并行或串行，以及它们的效果如何，取决于具体的模型设计、任务需求和可用资源。希望这个回答能帮助你！如果你还有其他问题，欢迎随时提问。⁷
>
>源: 与必应的对话， 2023/11/30
(1) Bert模型的面试版原理总结_面试bert模型-CSDN博客. https://blog.csdn.net/weixin_40821740/article/details/112135324.
(2) BERT训练问题（数据并行/模型并行） - CSDN博客. https://blog.csdn.net/lj2048/article/details/106080653.
(3) 为什么说串行比并行速度快？_为什么串行比并行快-CSDN博客. https://blog.csdn.net/SYT_Boss/article/details/82794420.
(4) 浅谈bert和lstm_bert和lstm运行速度-CSDN博客. https://blog.csdn.net/weixin_39422563/article/details/104635784.
(5) 如何把BERT用在生成模型中？ - 知乎. https://www.zhihu.com/question/328483756.
(6) 关于ChatGPT：GPT和BERT的差别（易懂版） - 知乎专栏. https://zhuanlan.zhihu.com/p/607605399.
(7) . https://bing.com/search?q=BERT%e6%98%af%e4%b8%b2%e8%a1%8c%e8%bf%98%e6%98%af%e5%b9%b6%e8%a1%8c%e8%be%93%e5%87%ba.
(8) Bert输入输出是什么 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/248017234.
(9) 图解BERT：通俗的解释BERT是如何工作的 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/364966458.
(10) Bert：不就是transformer的编码器吗！ - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/301146068.
(11) BERT 详解 - 知乎. https://zhuanlan.zhihu.com/p/103226488.
(12) 移位寄存器——数电第六章学习_看星河的兔子的博客-CSDN博客. https://blog.csdn.net/fcxgfdjy/article/details/123983999.
(13) 关于最近实践 Bert 的一些坑 - 知乎 - 知乎专栏. https://zhuanlan.zhihu.com/p/69389583.
(14) undefined. https://cloud.tencent.com/developer/article/1849507.
(15) undefined. https://zhuanlan.zhihu.com/p/125655365.

36. dropout的作用和原理，训练和推理过程有什么区别？在激活函数之前还是之后进行？
> **Dropout** 是一种在深度学习中常用的防止过拟合的策略¹²³。其主要原理是在训练过程中，每个神经元都有一定概率被临时"丢弃"，即在前向传播过程中，让某个神经元的激活值以一定的概率p停止工作¹。这样可以使模型的泛化性更强，因为它不会过分依赖某些局部的特征¹。
>
> 在**训练阶段**，Dropout会随机丢弃一部分神经元（让一部分隐层节点值为0），可以明显地减少过拟合现象¹。这种方式可以减少特征检测器（隐层节点）间的相互作用¹。
>
> 然而，在**推理或测试阶段**，我们通常使用完整的网络，即所有神经元都是活跃的⁵。此时，为了保持训练和测试阶段的输出一致，需要对激活值进行缩放，即乘以保留的概率值⁵。
>
> 至于Dropout层是在激活函数之前还是之后进行，这主要取决于具体的应用和网络结构。在实践中，Dropout通常放在激活函数后⁷。但是，这并不是绝对的，也有研究者在激活函数之前使用Dropout⁷。具体使用哪种方式，可能需要根据实验结果和具体任务来决定。⁷
>
>源: 与必应的对话， 2023/11/30
(1) 深度学习中Dropout原理解析 - 知乎. https://zhuanlan.zhihu.com/p/38200980.
(2) Dropout详解 - 知乎. https://zhuanlan.zhihu.com/p/390990848.
(3) dropout原理和作用 - 百家号. https://baijiahao.baidu.com/s?id=1747562058954045563.
(4) 关于dropout的测试阶段和训练阶段? - 知乎. https://www.zhihu.com/question/402485242.
(5) Dropout有效缓解过拟合 - 知乎. https://zhuanlan.zhihu.com/p/118390256.
(6) Dropout的Bagging思想以及使用要点 - 知乎. https://zhuanlan.zhihu.com/p/163833907.
(7) BN和Dropout在训练和测试时的差别 - 知乎. https://zhuanlan.zhihu.com/p/61725100.
(8) 为什么神经网络的Dropout层一般放在激活函数之后？ - 知乎. https://www.zhihu.com/question/395028350.
(9) dropout 放在激活前后 - CSDN. https://www.csdn.net/tags/MtTaEg1sMDMyNzI1LWJsb2cO0O0O.html.
(10) 【Pytorch】nn.Dropout的用法_马里亚纳Mariana的博客-CSDN博客. https://blog.csdn.net/weixin_47050107/article/details/122722516.
(11) 在神经网络中，先进行BatchNorm还是先运行激活函数？ - 知乎. https://www.zhihu.com/question/356571056.

37. 介绍一下二维卷积。卷积的最大池化层如何反向传播？
> **二维卷积**是卷积神经网络（Convolutional Neural Network，CNN）中最常见的层之一¹。在图像处理任务中，卷积层通过滑动一个称为卷积核或滤波器的小矩阵在输入图像上进行卷积操作，提取出特定的特征信息¹。在二维卷积层中，卷积核是一个二维矩阵，和输入的图片进行逐元素乘法和求和计算，得到输出的特征图¹。卷积层可以将卷积核看作一组可学习的参数，这些参数会随着训练数据的输入而自动调整¹。这样，在训练过程中，卷积层可以通过学习不同的卷积核来提取输入图像的不同特征¹。
>
> **最大池化层的反向传播**相对直观⁵⁷⁸⁹。在最大池化的前向传播中，只有区域中的最大值对池化后的结果有影响，其他值被舍弃⁵⁷⁸⁹。因此，在反向传播时，误差只会传递到前一层中对应的最大值的位置，而其他位置的误差为0⁵⁷⁸⁹。这就需要在前向传播时记录下最大值的位置，以便在反向传播时使用⁵。这种方法被称为**反向最大池化**⁵⁷⁸⁹。
>
> 希望这个回答能帮助你！如果你还有其他问题，欢迎随时提问。⁷
>
> 源: 与必应的对话， 2023/11/30
(1) 详解二维卷积 - 知乎. https://zhuanlan.zhihu.com/p/616518187.
(2) 卷积神经网络(CNN)反向传播算法推导 - 知乎. https://zhuanlan.zhihu.com/p/61898234.
(3) 池化层pooling操作如何参与反向传播？ - 知乎专栏. https://zhuanlan.zhihu.com/p/258604402.
(4) 池化层（pooling）的反向传播是怎么实现的_反向池化-CSDN博客. https://blog.csdn.net/Jason_yyz/article/details/80003271.
(5) CNN中卷积层 池化层反向传播 - WSX_1994 - 博客园. https://www.cnblogs.com/WSX1994/p/11230121.html.
(6) 卷积 Convolution 原理及可视化 - 知乎. https://zhuanlan.zhihu.com/p/76606892.
(7) 从零开始深度学习(三) 卷积层 - 知乎. https://zhuanlan.zhihu.com/p/69990159.
(8) 【卷积神经网络】二维卷积层（conv-layer） - CSDN博客. https://blog.csdn.net/qq_46092061/article/details/122360571.
(9) 17.5 池化的前向计算与反向传播 - AI-EDU. https://bing.com/search?q=%e5%8d%b7%e7%a7%af%e7%9a%84%e6%9c%80%e5%a4%a7%e6%b1%a0%e5%8c%96%e5%b1%82%e5%8f%8d%e5%90%91%e4%bc%a0%e6%92%ad.
(10) undefined. http://ufldl.stanford.edu/tutorial/supervised/FeatureExtractionUsingConvolution/.
(11) undefined. http://cs231n.github.io/convolutional-networks/侵删.
(12) undefined. https://grzegorzgwardys.wordpress.com/2016/04/22/8/侵删.

以下是我自己面试时遇到的一些问题：

1. 有哪些常用的分类损失函数？
2. 如何防止梯度爆炸？
3. 如何防止过拟合？
4. 交叉熵损失的原理是什么？
5. PCA是如何推导得到的？
6. 链表反向
7. 什么样的Prompt是好的？
8. 给一个一元函数（例如$y=3x^2+10$）和自变量取值范围，求最小值

