import binascii
from hashlib import blake2b, sha3_256

import base58
import base64
import cbor
import requests

tx_body = input('Base64 tx: ')

print('Decoding transaction...')
tx_aux = cbor.loads(base64.b64decode(tx_body))

decode = lambda val: [x.hex() if getattr(x, 'hex', None) else x for x in cbor.loads(val[1].value)]
inputs = [decode(x) for x in tx_aux[0][0]]
witnesses = [decode(x)[0] for x in tx_aux[1]]

TX_CACHE = {}


def get_tx_output_address(tx_id, idx):
    if tx_id in TX_CACHE:
        tx_outputs = TX_CACHE[tx_id]
    else:
        tx = requests.get(f'https://cardanoexplorer.com/api/txs/summary/{tx_id}').json()
        if 'Right' not in tx:
            raise BaseException(f'Failed to query the tx: {idx}')
        tx_outputs = tx['Right']['ctsOutputs']
        TX_CACHE[tx_id] = tx_outputs
    if idx >= len(tx_outputs):
        raise BaseException(f'Input pointer does not match referenced tx! {{idx={inp[1]}, outputs={tx_outputs}')
    return tx_outputs[idx][0]


print('Iterating inputs and loading addresses...')
for i, inp in enumerate(inputs):
    print('-----')
    print(f'Input: {inp}')
    print(f'PubKey: {witnesses[i]}')

    address = get_tx_output_address(*inp)
    print(f'Address: {address}')

    decodedAddr = cbor.loads(base58.b58decode(address))
    taggedAddr = decodedAddr[0]
    addrChecksum = decodedAddr[1]
    checksum = binascii.crc32(taggedAddr.value)
    if not addrChecksum == checksum:
        raise BaseException(f'Invalid Cardano address! {address}')

    dec = cbor.loads(taggedAddr.value)
    addressType = dec[2]
    if addressType != 0:
        raise BaseException(f'Unsupported address type: {addressType}')

    rootProvided = dec[0].hex()
    print(f'Address root found: {rootProvided}')

    ext = [0, [0, binascii.unhexlify(witnesses[i])], dec[1]]
    rootCalculated = blake2b(sha3_256(cbor.dumps(ext, sort_keys=True)).digest(), digest_size=28).digest().hex()
    print(f'Public key matches the address: {rootProvided == rootCalculated}')
