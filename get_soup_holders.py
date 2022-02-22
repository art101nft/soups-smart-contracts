from os import getenv
from os.path import abspath
from json import load as json_load
from json import dumps as json_dumps

import arrow
import requests
from web3 import Web3
from dotenv import load_dotenv


# Read from .env
load_dotenv()

# web3 providers and network details
MAINNET = getenv('MAINNET', 'false')
MAINNET = MAINNET != 'false'
INFURA_PID = getenv('INFURA_PID')
if MAINNET:
    WEB3_PROVIDER_URI = f'https://mainnet.infura.io/v3/{INFURA_PID}'
    NETWORK = '1'
else:
    WEB3_PROVIDER_URI = f'https://rinkeby.infura.io/v3/{INFURA_PID}'
    NETWORK = '4'

w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER_URI))


def get_eth_contract(_rp):
    """
    Return a web3 contract object for a compiled
    contract at a given relative path.
    """
    compiled_contract_path = abspath(_rp)

    with open(compiled_contract_path) as file:
        contract_json = json_load(file)
        contract_abi = contract_json['abi']
        deployed_contract_address = contract_json['networks'][NETWORK]['address'].lower()

    deployed_contract_address = w3.toChecksumAddress(deployed_contract_address)
    contract = w3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    return contract

if __name__ == '__main__':
    print(f'[{arrow.now()}] Taking snapshot of NFS hodlers.')

    nfs_owners = list()
    master_dict, merkle_dict = dict(), dict()
    nfs_contract = get_eth_contract('./build/contracts/NonFungibleSoup.json')
    nfs_supply = nfs_contract.functions.totalSupply().call()
    print(f'[{arrow.now()}] Looping through NFS supply ({nfs_supply})')
    for i in range(1, nfs_supply + 1):
        tokenID = nfs_contract.functions.getTokenId(i).call()
        owner = nfs_contract.functions.ownerOf(tokenID).call()
        print(f'[NFS][{i} / {nfs_supply}] Owner {owner}')
        if owner not in nfs_owners:
            nfs_owners.append(owner)

        if owner not in master_dict:
            master_dict[owner] = 1
        else:
            master_dict[owner] += 1

    print(f'[{arrow.now()}] Found {len(nfs_owners)} addresses holding NFS!')

    # # Make our amounts strings for parsing with go-merkle-distributor
    for i in master_dict:
        merkle_dict[i] = str(master_dict[i])

    # # Save file
    print(f'[{arrow.now()}] Found {len(nfs_owners)} NFS holders for whitelisting! Storing addresses and claimable tokens for generating merkle tree for distribution.')
    with open('output.json', 'w') as f:
        f.write(json_dumps(merkle_dict))

    with open('output.csv', 'a') as f:
        for i in master_dict:
            f.write(f'{i},{master_dict[i]}\n')
