import {ethers} from "ethers";
import {ChainId} from "@biconomy/core-types";
import logger from "../winston/index.js";

import {
    BiconomySmartAccount,
} from "@biconomy/account";

const privateKey = process.env.WALLET_PRIVATE_KEY
const rpcUrl = process.env.RPC_URL
const biconomyApikey = process.env.BICONOMY_API_KEY

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
