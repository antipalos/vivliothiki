#!/usr/bin/env bash

echo 'Trying to UN-install the `validate-cardano-tx-input-pk.py` script'

echo 'Unlinking the script'
rm /usr/local/bin/validate-cardano-tx-input-pk

echo 'Removing the script itself'
rm ~/.local/script/validate-cardano-tx-input-pk.py

echo 'Script is successfully UN-installed'