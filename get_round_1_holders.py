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
    # Debug
    print(f'[{arrow.now()}] Taking snapshot of NFS, MND, and BB hodlers.')

    # Hold a list of owners
    nfs_owners, mnd_owners, bb_owners, gbs_owners = list(), list(), list(), list()
    master_dict, merkle_dict = dict(), dict()
    master_list = list()

    # Get contract objects
    nfs_contract = get_eth_contract('./build/contracts/NonFungibleSoup.json')
    mnd_contract = get_eth_contract('./build/contracts/Mondrian.json')
    bb_contract = get_eth_contract('./build/contracts/Bauhaus.json')
    gbs_contract = get_eth_contract('../goodboi-smart-contracts/build/contracts/GoodBoiSociety.json')

    # Determine supply for the others
    nfs_supply = nfs_contract.functions.totalSupply().call()
    mnd_supply = mnd_contract.functions.totalSupply().call()
    bb_supply = bb_contract.functions.totalSupply().call()
    gbs_supply = gbs_contract.functions.totalSupply().call()

    # Loop through each contract and store addresses of all hodlers
    details = [
        ('GBS', gbs_contract, gbs_supply, gbs_owners),
        ('NFS', nfs_contract, nfs_supply, nfs_owners),
        ('MND', mnd_contract, mnd_supply, mnd_owners),
        ('BB', bb_contract, bb_supply, bb_owners)
    ]
    for d in details:
        token, contract, supply, owners = d[0], d[1], d[2], d[3]
        master_dict[token] = {}
        print(f'[{arrow.now()}] Looping through {token} supply ({supply})')
        for i in range(1, supply + 1):
            if token == 'GBS':
                tokenID = contract.functions.getTokenId(i).call()
                owner = contract.functions.ownerOf(tokenID).call()
            else:
                owner = contract.functions.ownerOf(i).call()
            print(f'[{token}][{i} / {supply}] Owner {owner}')
            if owner not in owners:
                owners.append(owner)

            if owner not in master_list:
                master_list.append(owner)

            if owner not in master_dict:
                master_dict[token][owner] = 1
            else:
                master_dict[token][owner] += 1

    patrn_users = requests.get('https://patrn.me/api/v1/list_users').json()
    for addr in patrn_users:
        if addr not in master_list:
            master_list.append(addr)

    print(f'[{arrow.now()}] Found {len(patrn_users)} addresses registered on Patrn!')
    print(f'[{arrow.now()}] Found {len(gbs_owners)} addresses holding GBS!')
    print(f'[{arrow.now()}] Found {len(nfs_owners)} addresses holding NFS!')
    print(f'[{arrow.now()}] Found {len(mnd_owners)} addresses holding MND!')
    print(f'[{arrow.now()}] Found {len(bb_owners)} addresses holding BB!')

    # # Make our amounts strings for parsing with go-merkle-distributor
    for i in master_list:
        merkle_dict[i] = str(2)

    # # Save file
    print(f'[{arrow.now()}] Found {len(master_list)} Art101 holders and Patrn users for whitelisting! Storing addresses and claimable tokens for generating merkle tree for distribution.')
    with open('holders.json', 'w') as f:
        f.write(json_dumps(master_dict))

    with open('output.json', 'w') as f:
        f.write(json_dumps(merkle_dict))
