import {ethers} from "ethers";
import {ChainId} from "@biconomy/core-types";
import logger from "../winston/index.js";

import {
    BiconomySmartAccount, DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import {Alchemy, Network} from "alchemy-sdk";
import {Bundler} from "@biconomy/bundler";

const privateKey = process.env.WALLET_PRIVATE_KEY
const rpcUrl = process.env.RPC_URL
const biconomyApiKey = process.env.BICONOMY_API_KEY
const alchemyApiKey = process.env.ALCHEMY_API_KEY

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(privateKey, provider);
const treasuryChain = ChainId.POLYGON_MUMBAI

const createBiconomySmartAccount = async () => {
    const bundler = new Bundler({
        bundlerUrl: 'https://bundler.biconomy.io/api/v2/80001/abc',
        chainId: treasuryChain,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    })
    const biconomySmartAccountConfig = {
        signer: signer,
        chainId: treasuryChain,
        bundler: bundler,
    };
    const biconomyAccount = new BiconomySmartAccount(biconomySmartAccountConfig)
    return await biconomyAccount.init()
}

export const sendAssets = async (address, chain, asset, assetAmount) => {
    const smartAccount = await createBiconomySmartAccount();

    let transactions = null;
    if(isOnSameChain(chain)) {
        if(asset === 'MATIC') {
            transactions = [createTxForNativeOnSameChain(address, assetAmount)]
        } else {
            //TODO send ERC20 on same chain
        }
    } else {
        if(asset === 'MATIC') {
            transactions = [createTxForNativeOnDifferentChain(address, assetAmount)]
        } else {
            //TODO send ERC20 on different chain
        }
    }

    const userOp = await smartAccount.buildUserOp(transactions)
    userOp.paymasterAndData = "0x"

    const userOpResponse = await smartAccount.sendUserOp(userOp)

    const transactionDetail = await userOpResponse.wait()
    logger.debug(transactionDetail)
    console.log("transaction detail below")
    console.log(transactionDetail)
    return transactionDetail
}

export const deploySmartAccount = async () => {
    const biconomySmartAccount = await createBiconomySmartAccount()
    const address = await biconomySmartAccount.getSmartAccountAddress()
    logger.debug(`SmartAccount deployed on : ${address}`)
    return address
}

export const summarizeAssets = async (interaction, guildUuid, db) => {
    const network = Network.MATIC_MAINNET;
    const config = {
        apiKey: alchemyApiKey,
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

const createTxForNativeOnSameChain = (address, assetAmount) => {
    const transaction = {
        to: address,
        data: '0x',
        value: ethers.utils.parseEther(assetAmount),
    }
    return transaction
}

const isOnSameChain = (chain) => {
    return (chain === 'polygon-mumbai' && treasuryChain === ChainId.POLYGON_MUMBAI)
    || (chain === 'polygon-mainnet' && treasuryChain === ChainId.POLYGON_MAINNET)
}

const createTxForNativeOnDifferentChain = (address, chain, assetAmount) => {

}