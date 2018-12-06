## About
A script that allows to validate public-keys for each input in a signed encrypted Cardano transaction.

## Usage
When you launch the script - it will print a prompt message:
```
Base64 tx:
```

And will wait for an input. All you need to do, is to past the Base64 encoded Cardano transaction, and press enter. Example:

```
Base64 tx: goOfggDYGFgkglggcAY/UOegqEK1ksQjy9bRpJOIY2KXfNzHeBRkIDfzTGYAggDYGFgkglggcAY/UOegqEK1ksQjy9bRpJOIY2KXfNzHeBRkIDfzTGYB/5+CgtgYWCGDWBw7/10lH9VClLnLEgPaVQqCEsALIi6QUqLjLOOPoAAaLzdKZhoAD0JAgoLYGFghg1gcetwEgtZY0/kg46Z97Tll9wbkrn6JIT8KnATwjaAAGuZQnNMaAC/Egv+ggoIA2BhYhYJYQP+q5haPRptHz1zPDVXuGlb+NeRLAGfGcbvTsybkhNufVf/gOSecTBBU1F3zN9JgmaLJYL3FX+Zk+Rhg/qx6qUpYQOImoAlLns4PyI6paQ9HQ/5zMM3vrZBf5EsHQQsIdJ1hDx6GhYcEiMqMwS99qvbPdsbPA7efassw1jRqzhNH1QiCANgYWIWCWEBRmviV7xWcL57NZrEkItsUzHqp8r73XrXP0PQwHRuH4c99NqhanF/GitBnqB5NDYCeom2LilJQgPhd+NAaXJVFWEBAAcexvrVaPzvF0dNTno6h0NJZBNEKn8E9+nIzm7EI09w/AIoMtbXIdPbnJ99RuKvU6tY85qGgXKaell7qzzgP
```

The script will:
1. Decode the transaction
2. Extract inputs and witness public-keys
3. For each pair of (input, witness) it will:
    1. Download the corresponding transaction output
    2. Extract and validate address
    3. Report whether the witness public-key matches the address
    
Example output:
```
Decoding transaction...
Iterating inputs and loading addresses...
-----
Input: ['70063f50e7a0a842b592c423cbd6d1a493886362977cdcc77814642037f34c66', 0]
PubKey: ffaae6168f469b47cf5ccf0d55ee1a56fe35e44b0067c671bbd3b326e484db9f55ffe039279c4c1054d45df337d26099a2c960bdc55fe664f91860feac7aa94a
Address: Ae2tdPwUPEZ8kFEZTT49eHR525ga9wNb6zveifAs7m1scwGbXnQZuPMtoXG
Address root found: 77a82a535769e83e8d4c353eb136bd2b51215fac4c1622e0f68af109
Public key matches the address: True
-----
Input: ['70063f50e7a0a842b592c423cbd6d1a493886362977cdcc77814642037f34c66', 1]
PubKey: 519af895ef159c2f9ecd66b12422db14cc7aa9f2bef75eb5cfd0f4301d1b87e1cf7d36a85a9c5fc68ad067a81e4d0d809ea26d8b8a525080f85df8d01a5c9545
Address: Ae2tdPwUPEYySUot7m6r3fysm79sHptU4zHEwmPXvpGarpB3ks5yFewXzsk
Address root found: 1a63769f457bd0f0d54ad4a814a5f72acea74a9caae29c6ce033b1a0
Public key matches the address: True
```

## Installing
You can either download and use the script with your own consideration, or you can
use this primitive ["install" script](install.sh). To install the script - call this command:
 
```bash
source /dev/stdin <<< "$(curl -s 'https://raw.githubusercontent.com/antipalos/vivliothiki/acea66b396cf4318cd939ef68ef113c1c3f73e67/cardano-sl/utils/validation/tx-input-pk/install.sh')"
```

To uninstall, this one:
```bash
source /dev/stdin <<< "$(curl -s 'https://raw.githubusercontent.com/antipalos/vivliothiki/acea66b396cf4318cd939ef68ef113c1c3f73e67/cardano-sl/utils/validation/tx-input-pk/uninstall.sh')"
```
