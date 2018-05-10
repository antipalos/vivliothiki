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
2. Calls `cAddr = encToCId skey` where `skey` is the key created at step 1
    1. [`encToCId`](https://github.com/input-output-hk/cardano-sl/blob/8d25c2ad3ca2354af8f8c43a2972d1b9a31bf440/wallet/src/Pos/Wallet/Web/ClientTypes/Functions.hs#L47) calls `encToPublic`
    2. [`encToPublic`](https://github.com/input-output-hk/cardano-sl/blob/8d25c2ad3ca2354af8f8c43a2972d1b9a31bf440/crypto/Pos/Crypto/Signing/Types/Safe.hs#L105) only uses [`encToSecret`](https://github.com/input-output-hk/cardano-sl/blob/8d25c2ad3ca2354af8f8c43a2972d1b9a31bf440/crypto/Pos/Crypto/Signing/Types/Safe.hs#L101) to extract simple secret key from encrypted pair and then calls `toPublic` with the result
    3. [`toPublic`](https://github.com/input-output-hk/cardano-sl/blob/8d25c2ad3ca2354af8f8c43a2972d1b9a31bf440/crypto/Pos/Crypto/Signing/Types/Signing.hs#L72) only calls `CC.toXPub` and wraps result into `PublicKey` type
    4. [`toXPub`](https://github.com/input-output-hk/cardano-crypto/blob/480839f6ebeec5fd45ffeccc9eeef27df315fae6/src/Cardano/Crypto/Wallet.hs#L142) from cardano-crypto module does all the work
3. `TODO`

### [`safeKeysFromPhrase`](https://github.com/input-output-hk/cardano-sl/blob/89c3266a0a3af0b5071d5aa162dfbec8e3204086/wallet/src/Pos/Util/BackupPhrase.hs#L76)
This function takes a password (`pp`) and a backup phrase (secret words, `ph`) ad returns a set of keys: `(EncryptedSecretKey, VssKeyPair)`

1. Calls `hashSeed = toHashSeed ph` where `ph` is the secret words
2. Calls [`safeDeterministicKeyGen`](https://github.com/input-output-hk/cardano-sl/blob/05bea127ac698bd8737d88c69e51de02ae3c2c17/crypto/Pos/Crypto/Signing/Safe.hs#L84) with the `hashSeed` from the step 1 and the password. This function returns tuple `(PublicKey, EncryptedSecretKey)` - caller applies `snd` and acquires encrypted secret key as `esk`.
3. Calls [`deterministicVssKeyGen`](https://github.com/input-output-hk/cardano-sl/blob/8d25c2ad3ca2354af8f8c43a2972d1b9a31bf440/crypto/Pos/Crypto/SecretSharing.hs#L88) with the `hashSeed` from the step 1. This SCRAPE function returns a specific VSS key pair that gets stored as `vss`
4. Then function just returns marvelous `(,) <$> esk <*> vss` expression that produces an **optional** tuple of the previously calculated values


### [`toHashSeed`](https://github.com/input-output-hk/cardano-sl/blob/89c3266a0a3af0b5071d5aa162dfbec8e3204086/wallet/src/Pos/Util/BackupPhrase.hs#L65)
This funtion converts secret words into a hasked bytestring seed.

See description of `toHashSeed` and `fromMnemonic` here: [seed_hashing.md](seed_hashing.md)

### [`safeDeterministicKeyGen`](https://github.com/input-output-hk/cardano-sl/blob/05bea127ac698bd8737d88c69e51de02ae3c2c17/crypto/Pos/Crypto/Signing/Safe.hs#L84)
This function takes a hash-seed as a `ByteString` and a password, and returns a tuple of `(PublicKey, EncryptedSecretKey)`.

1. Calls [`safeCreateKeypairFromSeed`](https://github.com/input-output-hk/cardano-sl/blob/05bea127ac698bd8737d88c69e51de02ae3c2c17/crypto/Pos/Crypto/Signing/Safe.hs#L66) which the seed and a password
    1. This one just redirects to [`CC.generate`](https://github.com/input-output-hk/cardano-crypto/blob/480839f6ebeec5fd45ffeccc9eeef27df315fae6/src/Cardano/Crypto/Wallet.hs#L89) and saves result as `prv`
    2. Applies [`CC.toXPub`](https://github.com/input-output-hk/cardano-crypto/blob/480839f6ebeec5fd45ffeccc9eeef27df315fae6/src/Cardano/Crypto/Wallet.hs#L143) to the received a public key from the private
    3. Returns a tuple of those two
2. The first element of the tuple is mapped into `PublicKey`, but the second element - [`mkEncSecretWithSaltUnsafe`](https://github.com/input-output-hk/cardano-sl/blob/8d25c2ad3ca2354af8f8c43a2972d1b9a31bf440/crypto/Pos/Crypto/Signing/Types/Safe.hs#L83) is called with salt and the passport.

###

## Discussion

Need to work thru BIP-39. It might require the same root key being produced from the same mnemonics always.
If so - that means that Cardano mnemonics also might be used as a Bitcoin wallet =)

But then it's not obvious how exactly different types of addresses are derived from the same key,
since Cardano-addresses looks nothing like Bitcoin-addresses.

Root key derived from 12 words is basically a long randomness. Many different stuff might be produced\derived from it.

[hd.md](https://github.com/input-output-hk/cardano-sl/blob/master/docs/hd.md) describes a lot of this stuff,
but does not provide actual implementation details - need to work thru BIP and the code.
