While the Wormhole ecosystem offers a vast array of components, the documentation does an excellent job of describing each one, with plenty of rich tutorials and examples.

However, there can be some confusion due to the existence of both https://book.wormhole.com/ and https://docs.wormhole.com/.

For instance, on https://book.wormhole.com/technical/evm/tokenLayer.html, it states, 'Here is an example of how to attest a token using the Typescript SDK,' but the link (https://book.wormhole.com/development/portal/evm/attestingToken.html) returns a 404 error.

Furthermore, after installing the SDK from https://www.npmjs.com/package/@certusone/wormhole-sdk, users may encounter issues when attempting to copy and paste the provided example, as certain elements like PublicKey, connection, Token, etc., appear unresolved. Unfortunately, the page doesn't offer clear explanations for these components.

Additionally, the process for a complete flow is not perfectly clear. Users need to wait for blockchain finality, which usually takes about 20-30 minutes on sepolia, to find the VAA and continue the flow. It's also unclear from which chain (original or target) we should proceed with different operations. An easy method to check the transaction status or receive info from relayers would be beneficial to address these concerns.

Regarding the method getSignedVAAWithRetry, its arguments lack clarity in terms of types and naming. Particularly, the "host" information is challenging to find in the documentation, and I had to dig into the existing repository to discover the correct host "['https://wormhole-v2-testnet-api.certus.one/']" for testnet usage. Additionally, the exact type expected for the emitter address (which needs to be 32 bytes) should be explicitly stated to avoid confusion.