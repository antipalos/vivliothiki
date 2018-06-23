# KEVM JS (web3) example

Example of using the Cardano KEVM testnet
with a standard Ethereum JS `"web3"` client.

## About

User `Mark` (`@mjackson001`) proposed the initial draft of this script in
the official dev telegram channel - https://t.me/CardanoDevelopersOfficial/6921

And it was also posted in the forum: https://forum.cardano.org/t/working-kevm-smart-contract-test-script/13137

> Ok - anyone interested in a full working example of a contract compile, deploy and test script, you can download the following script.
>
> You need to npm install the following packages: web3, solc, and request-promise-native.
>
> **After installing web3, you MUST apply the small patch included at the beginning of the script.  This patch modifies web3 to not use EIP-155 which the KEVM testnet does not implement.**
> 
> The first time you run the script, it will generate a random private key.  Simply add the line of code to the beginning of the script and every time you run it, it will use the same address for following runs.
> 
> The second time you run it (with a private key) it will request test tokens from the IOHK test faucet several times to get the minimum required balance.  This takes  a while because the faucet will give an error if too many requests are issued, so the script waits 60 seconds in between requests.  If you happen to get an error, just rerun the script.
> 
> After all this, the script will compile the inline solidity contract (source in the script), deploy it to the testnet, and use the setter and getter methods to demonstrate it working.
> 
> Hope this helps someone!