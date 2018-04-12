## Launcher

So, when user starts the Daedalus or a node - special launcher util is actually starts
and manages the launching, lifetime, fail-diagnostics, and updates for both the node and the wallet.

Utils is described here: https://github.com/input-output-hk/cardano-sl/blob/master/docs/launcher.md

## Wallets\Addresses

Next big thing to learn about is how exactly Cardano-SL manages wallets and addresses.

Basic info: Cardano uses HD (hierarchical) wallets:
1. https://cardanodocs.com/cardano/addresses/
2. https://cardanodocs.com/technical/hd-wallets/
3. https://github.com/input-output-hk/cardano-sl/blob/master/docs/hd.md

BIP-039 (mnemonic phrase) is used as a standard:
1. https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
2. https://cardanolaunch.com/assets/Ed25519_BIP.pdf

More detailed discussion of implementaion: [wallets_and_addresses.md](wallets_and_addresses.md)
