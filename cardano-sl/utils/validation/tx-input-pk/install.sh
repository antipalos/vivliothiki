#!/usr/bin/env bash

function detect() {
    if [[ -z "$(which $1)" ]]; then
      echo "[ERROR] No $1 detected! Exiting."
      exit 1
    fi;
    echo "$1 is detected"
}

echo 'Trying to install the `validate-cardano-tx-input-pk.py` script'
detect python3

echo 'Installing dependencies'
python3 -m pip install base58 cbor requests

echo 'Downloading script'
mkdir -p ~/.local/script
