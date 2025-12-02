// 官方推荐：使用 EnvHttpProxyAgent 自动读取系统代理环境变量
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";
setGlobalDispatcher(new EnvHttpProxyAgent());

import { createNft, fetchDigitalAsset, mplTokenMetadata, verifyCollectionV1, findMetadataPda } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, percentAmount, keypairIdentity, publicKey, isSome } from "@metaplex-foundation/umi";
import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

// ============ 配置 ============
const COLLECTION_ADDRESS = "AtioU7k2dT5dVWYG1vK2w2KP2oEr22HGu5w1NmgqKzd6";
const NFT_NAME = "PirateCat";
const NFT_URI = "https://gist.githubusercontent.com/Lin-xun1113/91a292292a53258659422f844323c7bd/raw/3e807fa11cb9e2e1de3b4c7ebadc3d7c73f8f0c8/pirate.json";
// ==============================

const connection = new Connection(clusterApiUrl("devnet"));
const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log("Loaded user:", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance with user identity\n");

const collectionAddress = publicKey(COLLECTION_ADDRESS);

// ============ 步骤 1: 创建 NFT ============
console.log("Step 1: Creating NFT...");

const mint = generateSigner(umi);

const createTx = await createNft(umi, {
    mint,
    uri: NFT_URI,
    name: NFT_NAME,
    sellerFeeBasisPoints: percentAmount(0),
    collection: {
        key: collectionAddress,
        verified: false,
    },
});

await createTx.send(umi);
console.log("NFT transaction sent! Waiting for confirmation...");

// 等待 NFT 创建确认
let nftCreated = false;
for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await fetchDigitalAsset(umi, mint.publicKey);
        nftCreated = true;
        console.log(`\n✅ NFT Created: ${getExplorerLink("address", mint.publicKey, "devnet")}`);
        break;
    } catch {
        process.stdout.write(".");
    }
}

if (!nftCreated) {
    throw new Error("NFT creation timeout");
}

// ============ 步骤 2: 验证 NFT 到 Collection ============
console.log("\nStep 2: Verifying NFT in collection...");

const verifyTx = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: mint.publicKey }),
    collectionMint: collectionAddress,
    authority: umi.identity,
});

await verifyTx.send(umi);
console.log("Verify transaction sent! Waiting for confirmation...");

// 等待验证确认
for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        const nft = await fetchDigitalAsset(umi, mint.publicKey);
        // 检查是否已验证
        if (isSome(nft.metadata.collection) && nft.metadata.collection.value.verified) {
            console.log(`\n✅ NFT Verified in Collection!`);
            console.log(`\n🎉 Done!`);
            console.log(`   NFT: ${getExplorerLink("address", mint.publicKey, "devnet")}`);
            console.log(`   Collection: ${getExplorerLink("address", collectionAddress, "devnet")}`);
            process.exit(0);
        }
    } catch {
        // ignore
    }
    process.stdout.write(".");
}

throw new Error("Verification timeout");
