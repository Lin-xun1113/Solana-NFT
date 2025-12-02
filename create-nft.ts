// 官方推荐：使用 EnvHttpProxyAgent 自动读取系统代理环境变量
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";
setGlobalDispatcher(new EnvHttpProxyAgent());

import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, percentAmount, keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log("Loaded user:", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance with user identity")

const collectionAddress = publicKey("AtioU7k2dT5dVWYG1vK2w2KP2oEr22HGu5w1NmgqKzd6");

console.log(`creating NFT...`);

const mint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint,
    uri: "https://gist.githubusercontent.com/Lin-xun1113/e36564a50484d42228fb70bff6418c47/raw/62d86c13138cc2a64e090336df42ea4c7d4b1e0c/gistfile1.json",
    name: "SunglassesCat",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
    collection: {
        key: collectionAddress,
        verified: false,
    },
});

// 发送交易（避免 WebSocket 确认问题）
const signature = await transaction.send(umi);
console.log("Transaction sent! Waiting for confirmation...");

// 等待交易确认（轮询检查）
for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        const createdNft = await fetchDigitalAsset(umi, mint.publicKey);
        console.log(`\nCreated NFT at ${getExplorerLink("address", createdNft.mint.publicKey, "devnet")}`);
        process.exit(0);
    } catch {
        process.stdout.write(".");
    }
}
throw new Error("Transaction confirmation timeout");
