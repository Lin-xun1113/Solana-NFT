# Solana NFT with Metaplex

使用 Metaplex MPL Token Metadata 在 Solana Devnet 上创建 NFT 的示例项目。

## 功能

- ✅ 创建 NFT Collection（集合）
- ✅ 创建 NFT 并关联到 Collection
- ✅ 验证 NFT 属于 Collection

## 技术栈

- **Solana** - 高性能区块链
- **Metaplex** - Solana 上的 NFT 标准
- **Umi** - Metaplex 的 TypeScript SDK
- **MPL Token Metadata** - NFT 元数据程序

## 安装

```bash
npm install
```

## 使用

### 1. 配置钱包

确保你的 Solana 钱包密钥对位于 `~/.config/solana/id.json`

```bash
solana-keygen new  # 如果没有的话
```

### 2. 配置代理（中国网络需要）

```bash
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
```

### 3. 运行脚本

```bash
# 步骤 1: 创建 Collection
npx esrun create-collection.ts

# 步骤 2: 创建 NFT（需要先修改 collectionAddress）
npx esrun create-nft.ts

# 步骤 3: 验证 NFT（需要先修改 nftAddress）
npx esrun verify-nft.ts
```

## 文件说明

| 文件                   | 说明                                                |
| ---------------------- | --------------------------------------------------- |
| `create-collection.ts` | 创建 NFT 集合                                       |
| `create-nft.ts`        | 创建单个 NFT 并关联到集合                           |
| `verify-nft.ts`        | 验证 NFT 属于集合（需要 Collection authority 签名） |

## 已创建的 NFT

- **Collection**: [F4UqiTQe9srBzuo2P7RcGjk2gJYSAcK1gd5VcY4h9x5v](https://explorer.solana.com/address/F4UqiTQe9srBzuo2P7RcGjk2gJYSAcK1gd5VcY4h9x5v?cluster=devnet)
- **NFT**: [6HBF8HfsdAxw7L5XrtwMGgVXQbzfVDkqwhHo8ctv61wX](https://explorer.solana.com/address/6HBF8HfsdAxw7L5XrtwMGgVXQbzfVDkqwhHo8ctv61wX?cluster=devnet)

## 元数据格式

NFT 的 `uri` 指向一个 JSON 文件：

```json
{
  "name": "SunglassesCat",
  "symbol": "CAT",
  "description": "A cool cat with sunglasses",
  "image": "https://example.com/cat.png",
  "attributes": [
    { "trait_type": "Background", "value": "Blue" }
  ]
}
```

## 注意事项

1. **代理问题**: 中国网络需要配置 HTTP 代理，代码中使用 `undici` 的 `EnvHttpProxyAgent` 自动读取环境变量
2. **WebSocket**: 由于 WebSocket 不走 HTTP 代理，交易确认使用轮询方式而非 `sendAndConfirm`
3. **Devnet**: 本项目运行在 Devnet，需要 SOL 可通过 airdrop 获取

## 参考

- [Metaplex Documentation](https://developers.metaplex.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Umi Documentation](https://github.com/metaplex-foundation/umi)

## License

ISC
