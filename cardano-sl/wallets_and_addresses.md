# Wallets\Addresses (implementation)

## Sources
Basic info: Cardano uses HD (hierarchical) wallets:
1. https://cardanodocs.com/cardano/addresses/
2. https://cardanodocs.com/technical/hd-wallets/
3. https://github.com/input-output-hk/cardano-sl/blob/master/docs/hd.md

BIP-039 (mnemonic phrase) is used as a standard:
1. https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
2. https://cardanolaunch.com/assets/Ed25519_BIP.pdf

## Stuff we still need to know:
1. How exactly 12 words are transformed "root key[s]"? (BIP?)
2. How exactly Cardano-specific addresses (like `DdzFFzC...dAv7xb`) are derived from root key?

## What we have for now:

**Note!** That links are pointing to specific commits, in case target file changes!
Don't forget to check latest master when working with a linked file!

1. There's a module with utils for mnemonics, like `fromMnemonics` and `toMnemonics`.
And it also contains the whole list of 2048 BIP-39 words. Need to work thru it to understand what `fromMnemonics` does.
[Mnemonics.hs](https://github.com/input-output-hk/cardano-sl/blob/89c3266a0a3af0b5071d5aa162dfbec8e3204086/wallet/src/Pos/Util/Mnemonics.hs)

2. There's also the [BackupPhrase.hs](https://github.com/input-output-hk/cardano-sl/blob/89c3266a0a3af0b5071d5aa162dfbec8e3204086/wallet/src/Pos/Util/BackupPhrase.hs)
module that imports `Mnemonics` and contains type `BackupPhrase` (as `[Text]`) that describes the mnemonics received from user.

3. Module [HD.hs](https://github.com/input-output-hk/cardano-sl/blob/f5b8073b92b8219ae5fbb038c0ceb4a19502a86b/crypto/Pos/Crypto/HD.hs)
contains very important stuff, like `deriveHDSecretKey` that produces private keys for adrresses from root seed.
Descibed as "Hierarchical derivation interface".

4. Module [Account.hs](https://github.com/input-output-hk/cardano-sl/blob/5af8f0a116069359e6cd4a1b1636394a032f7503/wallet/src/Pos/Wallet/Web/Account.hs)
contains "Helpers for Wallet Set, Wallet and Account".

## Discussion

Need to work thru BIP-39. It might require the same root key being produced from the same mnemonics always.
If so - that means that Cardano mnemonics also might be used as a Bitcoin wallet =)

But then it's not obvious how exactly different types of addresses are derived from the same key,
since Cardano-addresses looks nothing like Bitcoin-addresses.

Root key derived from 12 words is basically a long randomness. Many different stuff might be produced\derived from it.

[hd.md](https://github.com/input-output-hk/cardano-sl/blob/master/docs/hd.md) describes a lot of this stuff,
but does not provide actual implementation details - need to work thru BIP and the code.
