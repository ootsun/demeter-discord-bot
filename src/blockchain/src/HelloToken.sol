// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "wormhole-solidity-sdk/WormholeRelayerSDK.sol";

contract HelloToken is TokenSender, TokenReceiver {
    uint256 constant value = 0;
    uint256 constant gasLimit = 1000000;

    constructor(
        address _wormholeRelayer,
        address _tokenBridge,
        address _wormhole
    ) TokenBase(_wormholeRelayer, _tokenBridge, _wormhole) {}

    function quoteCrossChainDeposit(
        uint16 targetChain
    ) public view returns (uint256 cost) {
        (cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(
            targetChain,
            value,
            gasLimit
        );
        return cost;
    }

    /**
     * Sends, through Token Bridge,
     * 'amount' of the IERC20 token 'wrappedToken'
     * to the address 'recipient' on chain 'targetChain'
     *
     * where 'wrappedToken' is a wormhole-wrapped version
     * of the IERC20 token 'token' on this chain (which can later
     * be redeemed for 'token')
     *
     * Assumes that 'amount' of 'token' was approved to be transferred
     * from msg.sender to this contract
     */
    function sendCrossChainDeposit(
        uint16 targetChain,
        address targetHelloToken,
        address recipient,
        uint256 amount,
        address token
    ) public payable {
        uint256 cost = quoteCrossChainDeposit(targetChain);
        require(msg.value == cost);
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        sendTokenWithPayloadToEvm(
            targetChain,
            targetHelloToken,
            abi.encode(recipient),
            value,
            gasLimit,
            token,
            amount
        );
    }

    /**
     * receivePayloadAndTokens should
     * 1) obtain the intended 'recipient' address from the payload
     * 2) transfer the correct amount of the correct token to that address
     *
     * Only 'wormholeRelayer' should be allowed to call this method
     *
     * @param payload the payload sent by 'sendCrossChainDeposit'
     * @param receivedTokens This will be an array of length 1
     * describing the amount and address of the token received
     * (the 'amount' field indicates the amount,
     * and the 'tokenAddress' field indicates the address of the IERC20 token
     * that was received, which will be a wormhole-wrapped version of the sent token)
     */
    function receivePayloadAndTokens(
        bytes memory payload,
        TokenReceived[] memory receivedTokens,
        bytes32, // sourceAddress
        uint16, // sourceChain
        bytes32 // deliveryHash
    ) internal override {
        require(
            msg.sender == address(wormholeRelayer),
            "Only wormholeRelayer can call receivePayloadAndTokens"
        );

        require(receivedTokens.length == 1, "Expected 1 token");
        address recipient = abi.decode(payload, (address));
        IERC20(receivedTokens[0].tokenAddress).transfer(
            recipient,
            receivedTokens[0].amount
        );
    }
}
