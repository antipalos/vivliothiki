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

### API Handling
What happens when someone calls API methods to create or restore a wallet

1. This file contains the API endpoint descriptions: https://github.com/input-output-hk/cardano-sl/blob/d69ad6c455890fc961722b36718b65d9e58bde62/wallet-new/src/Cardano/Wallet/API/V1/Wallets.hs

2. This file contains API endpoint payloads (JSON is parsed into those), including `NewWallet`: https://github.com/input-output-hk/cardano-sl/blob/d69ad6c455890fc961722b36718b65d9e58bde62/wallet-new/src/Cardano/Wallet/API/V1/Types.hs#L472

3. This file contains handlers that get executed when API endpoint is called: https://github.com/input-output-hk/cardano-sl/blob/d69ad6c455890fc961722b36718b65d9e58bde62/wallet-new/src/Cardano/Wallet/API/V1/LegacyHandlers/Wallets.hs#L66. Note how this method selects one of two functions to call: `V0.newWallet` or `V0.restoreWalletFromSeed`

4. This file contains those functions that get called from handler: https://github.com/input-output-hk/cardano-sl/blob/fa6ee2bbe5ba1016fba9ceb50b8042c3d2af1041/wallet/src/Pos/Wallet/Web/Methods/Restore.hs#L77. Note, how both of them call `mkWallet` in result with different third boolean transaction (restoration or creation). Function `mkWallet` seem to do all the interesting work.

### [`mkWallet`](https://github.com/input-output-hk/cardano-sl/blob/fa6ee2bbe5ba1016fba9ceb50b8042c3d2af1041/wallet/src/Pos/Wallet/Web/Methods/Restore.hs#L58)

1. First thing it calls [`genSaveRootKey`](https://github.com/input-output-hk/cardano-sl/blob/8d25c2ad3ca2354af8f8c43a2972d1b9a31bf440/wallet/src/Pos/Wallet/Web/Account.hs#L95) with a password and secret words, which redirects to the pure [`safeKeysFromPhrase`](https://github.com/input-output-hk/cardano-sl/blob/89c3266a0a3af0b5071d5aa162dfbec8e3204086/wallet/src/Pos/Util/BackupPhrase.hs#L76)

2. `TODO`

### [`safeKeysFromPhrase`](https://github.com/input-output-hk/cardano-sl/blob/89c3266a0a3af0b5071d5aa162dfbec8e3204086/wallet/src/Pos/Util/BackupPhrase.hs#L76)
This function takes a password (`pp`) and a backup phrase (secret words, `ph`) ad returns a set of keys: `(EncryptedSecretKey, VssKeyPair)`

1. Calls `hashSeed = toHashSeed ph` where `ph` is the secret words
2. Calls [`safeDeterministicKeyGen`](https://github.com/input-output-hk/cardano-sl/blob/05bea127ac698bd8737d88c69e51de02ae3c2c17/crypto/Pos/Crypto/Signing/Safe.hs#L84) with the `hashSeed` from the step 1 and the password. This function returns tuple `(PublicKey, EncryptedSecretKey)` - caller applies `snd` and acquires encrypted secret key as `esk`.
3. Calls [`deterministicVssKeyGen`](https://github.com/input-output-hk/cardano-sl/blob/8d25c2ad3ca2354af8f8c43a2972d1b9a31bf440/crypto/Pos/Crypto/SecretSharing.hs#L88) with the `hashSeed` from the step 1. This SCRAPE function returns a specific VSS key pair that gets stored as `vss`
4. Then function just returns marvelous `(,) <$> esk <*> vss` expression that produces an **optional** tuple of the previously calculated values


### [`toHashSeed`](https://github.com/input-output-hk/cardano-sl/blob/89c3266a0a3af0b5071d5aa162dfbec8e3204086/wallet/src/Pos/Util/BackupPhrase.hs#L65)
Takes secret words (`bp`)

1. Calls [`toSeed`](https://github.com/input-output-hk/cardano-sl/blob/89c3266a0a3af0b5071d5aa162dfbec8e3204086/wallet/src/Pos/Util/BackupPhrase.hs#L62) on `bp`, which joins words with a space into a single string and applies `fromMnemonic` to it
2. Calls `blake2b` with the result of the `toSeed`, but `blake2` is actually the [`unsafeAbstractHash`](https://github.com/input-output-hk/cardano-sl/blob/447486e284d006f6d3ac2f7f55115baf18e00efe/crypto/Pos/Crypto/Hashing.hs#L144)
3. Then calls [`serialize'`](https://github.com/input-output-hk/cardano-sl/blob/8d25c2ad3ca2354af8f8c43a2972d1b9a31bf440/binary/Pos/Binary/Class/Primitive.hs#L67) which redirects to [`serialize`](https://github.com/input-output-hk/cardano-sl/blob/8d25c2ad3ca2354af8f8c43a2972d1b9a31bf440/binary/Pos/Binary/Class/Primitive.hs#L57)

### [`fromMnemonic`](https://github.com/input-output-hk/cardano-sl/blob/89c3266a0a3af0b5071d5aa162dfbec8e3204086/wallet/src/Pos/Util/Mnemonics.hs#L68)
This function takes mnemonic as a string of space-separated words and returns entropy [(according to BIP)](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)

1. Asserts: All words are ASKII; There are no more than 48 words; Number of words is divisible by 3
2. Get separate words and turn them into indexes from the word-list
3. [`indicesToBS`](https://github.com/input-output-hk/cardano-sl/blob/89c3266a0a3af0b5071d5aa162dfbec8e3204086/wallet/src/Pos/Util/Mnemonics.hs#L122) is used to turn index-list into a `ByteString` (called `ms_bs`)
4. Enthropy len and checksum len are calculated beautifully as `(ent_len, cs_len) = (word_count * 11) `quotRem` 32`
5. ByteString `ms_bs` is split into enthropy bytes and checksum bytes as `(ms_ent, ms_cs) = BS.splitAt (ent_len * 4) ms_bs`
6. Checksum from restored bytes (`ms_cs_num`) is compared to newly compared checksum (`ent_cs_num`), calculated by [`calcCS`](https://github.com/input-output-hk/cardano-sl/blob/89c3266a0a3af0b5071d5aa162dfbec8e3204086/wallet/src/Pos/Util/Mnemonics.hs#L89) (exception if checksums are not equal)
7. If all is ok - `ms_ent` is returned

## Discussion

Need to work thru BIP-39. It might require the same root key being produced from the same mnemonics always.
If so - that means that Cardano mnemonics also might be used as a Bitcoin wallet =)

But then it's not obvious how exactly different types of addresses are derived from the same key,
since Cardano-addresses looks nothing like Bitcoin-addresses.

Root key derived from 12 words is basically a long randomness. Many different stuff might be produced\derived from it.

[hd.md](https://github.com/input-output-hk/cardano-sl/blob/master/docs/hd.md) describes a lot of this stuff,
but does not provide actual implementation details - need to work thru BIP and the code.
