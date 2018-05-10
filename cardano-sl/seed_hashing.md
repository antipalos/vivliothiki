# Blake2b and `toHashSeed` in CSL backup-phrase processing

## Functions

### [`toHashSeed`](https://github.com/input-output-hk/cardano-sl/blob/89c3266a0a3af0b5071d5aa162dfbec8e3204086/wallet/src/Pos/Util/BackupPhrase.hs#L65) function
Takes secret words (`bp`) and returns serialized hashed seed. Steps:

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

## Replication (Python example)

### Blake2b
Function `unsafeAbstractHash` also uses CBOR serialization inside. Can be replcated with `pyblake2` and `cbor` libraries:<br/>
![](https://i.imgur.com/afQegQb.png)

Which gives the same HEX result as:<br/>
![](https://i.imgur.com/ZHrklxI.png)

**NOTE:** `cbor.dumps` takes **ByteString**!

### `toHashSeed`
But this function **also** additionally serializes result from blake2b, using `serialize'`. This might be replicated by additionally calling cbor:<br/>
![](https://i.imgur.com/4A1ZkaB.png)

Which gives the same byte as:<br/>
![](https://i.imgur.com/oXkneVX.png)

Same bytes just in decimal instead of HEX
