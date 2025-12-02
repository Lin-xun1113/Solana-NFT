// 官方推荐：使用 EnvHttpProxyAgent 自动读取系统代理环境变量
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";
setGlobalDispatcher(new EnvHttpProxyAgent());

import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, percentAmount, keypairIdentity } from "@metaplex-foundation/umi";
import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log("Loaded user:", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance with user identity")


const collectionMint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint: collectionMint,
    uri: "https://gist.githubusercontent.com/Lin-xun1113/035ddf5b3452053c9d7cb04a1199b20d/raw/2aab8aa52dbad1e9c8daac3d749736c5dee6de75/gistfile1.txt",
    name: "Cat Collection",
    symbol: "CAT",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
});
// 发送交易
const signature = await transaction.send(umi);
console.log("Transaction sent! Waiting for confirmation...");

// 等待交易确认（轮询检查）
for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        const createdCollectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey);
        console.log(`\nCreated Collection NFT! Address is: ${getExplorerLink("address", createdCollectionNft.mint.publicKey, "devnet")}`);
        process.exit(0);
    } catch {
        process.stdout.write(".");
    }
}
throw new Error("Transaction confirmation timeout");