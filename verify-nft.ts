// 官方推荐：使用 EnvHttpProxyAgent 自动读取系统代理环境变量
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";
setGlobalDispatcher(new EnvHttpProxyAgent());

import { fetchDigitalAsset, mplTokenMetadata, verifyCollectionV1, findMetadataPda } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log("Loaded user:", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance with user identity")

const collectionAddress = publicKey("F4UqiTQe9srBzuo2P7RcGjk2gJYSAcK1gd5VcY4h9x5v");

const nftAddress = publicKey("6HBF8HfsdAxw7L5XrtwMGgVXQbzfVDkqwhHo8ctv61wX");

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftAddress }),
    collectionMint: collectionAddress,
    authority: umi.identity,
});


// 发送交易（避免 WebSocket 确认问题）
const signature = await transaction.send(umi);
console.log("Transaction sent! Waiting for confirmation...");

// 等待交易确认（轮询检查）
for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        const createdNft = await fetchDigitalAsset(umi, nftAddress);
        console.log(`\nVerified NFT at ${getExplorerLink("address", createdNft.mint.publicKey, "devnet")}`);
        process.exit(0);
    } catch {
        process.stdout.write(".");
    }
}
throw new Error("Transaction confirmation timeout");
