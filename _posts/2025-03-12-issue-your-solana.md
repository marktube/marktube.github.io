---
layout: post
title: Trump同款——在Solana链上撒币
date: 2025-03-12 14:36:15
mathjax: false
disqus: true
categories: Block&nbsp;Chain
---

> ~~性感程序员 在线发币~~

本周一纳斯达克指数狂跌4%，加密货币也一路狂泻。在BTC跌到82000多的时候，我来了一波加仓，斥巨资3.0usdt买了一手，没想到直接跌到了80000左右，直到本周三上午重新站上83000。义眼钉真之下，直接挂一个limit order出掉，拿下3.04usdt。当年陈刀仔用20块赢到3700万，早入币圈十年我也能站起来好吧。今天去听了区块链的课程，顺手也发了一个币，但是不充钱还是没法变强，不上交易所就没有流动性，和废纸也没什么区别，下面就一步步地说一下发币流程。

### 🚀 第一步：安装必要的依赖库
1️⃣ 安装 solana-py 和其他工具：
```bash
pip install solana
pip install anchorpy
```
2️⃣ 验证安装成功：
```python
from solana.rpc.api import Client

client = Client("https://api.devnet.solana.com")
print(client.get_version())
# 获取最近的区块哈希
blockhash_response = client.get_latest_blockhash()
blockhash = blockhash_response.value.blockhash

print("Solana最新区块哈希:", blockhash)
```

### ✨ 第二步：创建钱包和获取测试币
1️⃣ 生成Solana钱包：
```python
from solders.keypair import Keypair
    
# 生成新的钱包
wallet = Keypair()
print("公钥:", wallet.pubkey())
print("私钥:", wallet.secret().hex())

# 保存公钥到一个文件
with open("wallet_public_key.json", "w") as f:
    f.write(wallet.pubkey().to_json())

# 保存私钥到一个文件
with open("wallet_private_key.txt", "w") as f:
    f.write(wallet.secret().hex())

```

2️⃣⚡ 拿测试币：

把上面生成的钱包公钥复制下来。
访问 [Solana Faucet](https://faucet.solana.com/)，粘贴公钥获取测试SOL币。需要GitHub账号确认开发者权限。


### 📦 第三步：部署智能合约并创建代币

1️⃣ 使用Python调用Solana的代币合约来创建你的代币：

```python
from spl.token.client import Token
from solders.pubkey import Pubkey

# 设置代币参数
decimals = 6  # 代币精度，6 表示最小单位为百万分之一
mint_authority = wallet.pubkey()
freeze_authority = wallet.pubkey()

# SPL Token Program 的程序ID
TOKEN_PROGRAM_ID = Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")

# 创建代币Mint账户
token = Token.create_mint(
    conn=client,
    payer=wallet,
    mint_authority=mint_authority,
    decimals=decimals,
    program_id=TOKEN_PROGRAM_ID,
    freeze_authority=freeze_authority
)

print("代币创建成功！Mint地址:", token.pubkey)

```

🎨 2️⃣ 添加代币的名称和符号


这部分涉及到metadata部分，与NFT一些操作有关，多数以js和rust为主，这里尝试用python解决，步骤较为繁琐，若不想添加信息可跳过。首先需要准备好你的metadata.json数据，这里面包含有代币的一些基本信息，例如：
```json
{
  "name": "chaos",
  "symbol": "YCL",
  "description": "Issued by [Yanchao Liu](https://blog.lyc.dns-dynamic.net/about.html). Please contact me for more infomation!",
  "image": "https://pub-cf46a11df41c416b8603f6b6e83a92eb.r2.dev/yanchao.png"
}
```
然后将这个json文件上传到一个可以通过网址访问到的云存储中，github仓库中或者cloudflare R2都可以，并且需要把这个网址记录下来。

```python
#from solders.transaction import Transaction
from solders.instruction import Instruction
from borsh_construct import CStruct, String, U8, U16, U64, Vec, Option, Bool, Enum
from construct import Bytes
import binascii
from solders.instruction import AccountMeta
from solders.message import MessageV0
from solders.transaction import VersionedTransaction


# some important public keys
system_program = Pubkey.from_string('11111111111111111111111111111111')
system_rent = Pubkey.from_string('SysvarRent111111111111111111111111111111111')
token_program = Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
token_metadata_program = Pubkey.from_string("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")

# my own keypair
my_keypair = wallet
# public key of my token
new_token = token.pubkey

# structure of the instruction
instruction_structure = CStruct(
    "instructionDiscriminator" / U8,
    "createMetadataAccountArgsV3" / CStruct(
        "data" / CStruct(
            "name" / String,
            "symbol" / String,
            "uri" / String,
            "sellerFeeBasisPoints" / U16,
            "creators" / Option(Vec(CStruct(
                "address" / Bytes(32),
                "verified" / Bool,
                "share" / U8
            ))),
            "collection" / Option(CStruct(
                "verified" / Bool,
                "key" / String
            )),
            "uses" / Option(CStruct(
                "useMethod" / Enum(
                    "Burn",
                    "Multiple",
                    "Single",
                    enum_name="UseMethod"
                ),
                "remaining" / U64,
                "total" / U64
            ))
        ),
        "isMutable" / Bool,
        "collectionDetails" / Option(String) # fixme: string is not correct, insert correct type
    )
)

# data for the instruction
instruction_data = {
    "instructionDiscriminator": 33,
    "createMetadataAccountArgsV3": {
        "data": {
            "name": "chaos",
            "symbol": "YCL",
            "uri": "https://pub-cf46a11df41c416b8603f6b6e83a92eb.r2.dev/metadata.json",
            "sellerFeeBasisPoints": 500,
            "creators": [
                {
                    "address": bytes(my_keypair.pubkey()),
                    "verified": 1,
                    "share": 100
                }
            ],
            "collection": None,
            "uses": None
        },
        "isMutable": 1,
        "collectionDetails": None
    }
}


# get pda of mint account
metadata_pda = Pubkey.find_program_address([b"metadata", bytes(token_metadata_program), bytes(new_token)], token_metadata_program)[0]
# account list for instruction
accounts = [
    AccountMeta(pubkey=metadata_pda, is_signer=False, is_writable=True), # metadata
    AccountMeta(pubkey=new_token, is_signer=False, is_writable=False), # mint
    AccountMeta(pubkey=my_keypair.pubkey(), is_signer=True, is_writable=False), # mint authority
    AccountMeta(pubkey=my_keypair.pubkey(), is_signer=True, is_writable=True), # payer
    AccountMeta(pubkey=my_keypair.pubkey(), is_signer=False, is_writable=False), # update authority
    AccountMeta(pubkey=system_program, is_signer=False, is_writable=False), # system program
    AccountMeta(pubkey=system_rent, is_signer=False, is_writable=False) # rent
]

# create instruction
instruction = Instruction(token_metadata_program, instruction_structure.build(instruction_data), accounts)

# send a transaction with the instruction to the network
# client = Client("https://api.devnet.solana.com")
latest_blockhash = client.get_latest_blockhash().value.blockhash

# 创建消息对象（v0版本）
message = MessageV0.try_compile(
    payer=my_keypair.pubkey(),
    instructions=[instruction],
    recent_blockhash=latest_blockhash,
    address_lookup_table_accounts=[]  # 如果没有使用地址查找表，可以传空列表
)

# 创建版本化交易，并签名
transaction = VersionedTransaction(message, [my_keypair])

# 序列化交易
serialized_tx = bytes(transaction)

# 发送交易
signature = client.send_raw_transaction(serialized_tx)
print("交易签名:", signature)
```

### 📲 第四步：创建代币账户并铸造代币

创建一个账户来持有代币并铸造100万个代币：

```python
# 创建代币账户
token_account = token.create_account(wallet.pubkey())

# 铸造代币
token.mint_to(
    token_account,
    wallet,
    1000000  # 铸造100万个代币
)

print("代币账户地址:", token_account)
print("已铸造100万个代币")
```

### 📈 第五步：进行代币转账

假如你有一个朋友的钱包地址 recipient_address，你可以用Python转账：

```python
# 接收者的钱包地址（把你的朋友地址填上）
recipient_address = Pubkey.from_string("7Ywy7mvFm2yxQTyDChko36ZLVetwiP2uS9h86WcnTffE")

# 创建接收者的代币账户
recipient_token_account = token.create_account(recipient_address)

# 发送500个代币
token.transfer(
    token_account,
    recipient_token_account,
    wallet,
    500
)

print(f"成功发送500个代币到 {recipient_address}")
```

### 🌟 第六步：查询余额

你还可以查询钱包的代币余额：
```python
# 查询代币账户余额
balance = token.get_balance(token_account)
print("代币余额:", balance)
```


### 🎯 第七步：确认你的代币

你可以使用Solana区块浏览器确认代币是否成功创建：

Devnet浏览器：https://explorer.solana.com?cluster=devnet
搜索 mint.pubkey() 输出的地址即可！

```python
from solana.rpc.types import TokenAccountOpts

# 朋友的钱包地址
friend_wallet = Pubkey.from_string("7Ywy7mvFm2yxQTyDChko36ZLVetwiP2uS9h86WcnTffE")

# 你的代币Mint地址
mint_address = token.pubkey

# 查询朋友持有的代币账户
response = client.get_token_accounts_by_owner(
    friend_wallet,
    TokenAccountOpts(mint=mint_address)
)

# 提取代币账户并获取余额
token_accounts = response.value
for account in token_accounts:
    pubkey = account.pubkey
    balance_info = client.get_token_account_balance(pubkey)
    balance = balance_info.value.ui_amount
    print(f"代币账户: {pubkey}，余额: {balance}")
```

最后祝大家玩的愉快！也可以留下你的地址，给你们airdrop一下我的[chaos币](https://explorer.solana.com/address/9qLny9vFCj1AWXN4brJMBksfcxpiiYBJmbLJefm3uTmS/metadata?cluster=devnet)！也可以赞助我的[pump.fun上发的币](https://pump.fun/coin/4uparnnqXjmyRv4UMEXxnEn479qt7Kk1Q8CsqmS4pump)，请你们去喝咖啡！


### 参考

https://solana.stackexchange.com/questions/7550/how-to-create-a-metadata-account-with-python

https://developers.metaplex.com/token-metadata/mint

https://chatgpt.com


