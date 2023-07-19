import {ethers} from "ethers";
import {ChainId} from "@biconomy/core-types";
import logger from "../winston/index.js";

import {
    BiconomySmartAccount,
} from "@biconomy/account";
import {Alchemy, Network} from "alchemy-sdk";

const privateKey = process.env.WALLET_PRIVATE_KEY
const rpcUrl = process.env.RPC_URL
const biconomyApikey = process.env.BICONOMY_API_KEY
const alchemyApikey = process.env.ALCHEMY_API_KEY

export const deploySmartAccount = async () => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);

    const biconomySmartAccountConfig = {
        signer: signer,
        chainId: ChainId.POLYGON_MAINNET,
        rpcUrl: rpcUrl,
    };
    const biconomyAccount = new BiconomySmartAccount(biconomySmartAccountConfig)
    const biconomySmartAccount = await biconomyAccount.init()

    const address = await biconomySmartAccount.getSmartAccountAddress()
    logger.debug(`SmartAccount deployed on : ${address}`)
    return address
}

export const summarizeAssets = async (interaction, guildUuid, db) => {
    const network = Network.MATIC_MAINNET;
    const config = {
        apiKey: alchemyApikey,
        network: network,
    };
    const alchemy = new Alchemy(config);
    const treasuryAddress = db.data[guildUuid].treasuryAddress;
    const balances = await alchemy.core.getTokenBalances(treasuryAddress);
    const nonZeroBalances = balances.tokenBalances.filter((token) => {
        return token.tokenBalance !== "0" && token.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000";
    });

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const nativeBalance = await provider.getBalance(treasuryAddress);
    const formattedNativeBalance = ethers.utils.formatEther(nativeBalance);

    let result = `Token balances of treasury (${treasuryAddress}) on ${network}:
    1. MATIC: ${formattedNativeBalance} MATIC`;
    let i = 2;
    for (let token of nonZeroBalances) {
        let balance = token.tokenBalance;
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
        balance = balance / Math.pow(10, metadata.decimals);
        balance = balance.toFixed(2);
        result += `\n${i++}. ${metadata.name}: ${balance} ${metadata.symbol}`;
    }
    return result
}