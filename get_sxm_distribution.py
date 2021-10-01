from os import getenv
from os.path import abspath
from json import load as json_load
from json import dumps as json_dumps

import arrow
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
    print(f'[{arrow.now()}] Taking snapshot of GBS, NFS, and MND hodlers.')

    # Hold a list of owners
    nfs_mnd_owners = list()
    nfs_owners = list()
    mnd_owners = list()
    gbs_owners = list()
    master_dict = dict()

    # Get contract objects
    nfs_contract = get_eth_contract('./build/contracts/NonFungibleSoup.json')
    mnd_contract = get_eth_contract('./build/contracts/Mondrian.json')
    gbs_contract = get_eth_contract('../goodboi-smart-contracts/build/contracts/GoodBoiSociety.json')

    # Determine supply for the others
    nfs_supply = nfs_contract.functions.totalSupply().call()
    mnd_supply = mnd_contract.functions.totalSupply().call()
    gbs_supply = gbs_contract.functions.totalSupply().call()

    # Loop through each contract and store addresses of all hodlers
    details = [
        ('NFS', nfs_contract, nfs_supply, nfs_owners),
        ('MND', mnd_contract, mnd_supply, mnd_owners),
        ('GBS', gbs_contract, gbs_supply, gbs_owners)
    ]
    for d in details:
        token, contract, supply, owners = d[0], d[1], d[2], d[3]
        print(f'[{arrow.now()}] Looping through {token} supply ({supply})')
        for i in range(1, supply + 1):
            tokenID = contract.functions.getTokenId(i).call()
            owner = contract.functions.ownerOf(tokenID).call()
            if owner not in owners:
                owners.append(owner)

    # Tally up allocation of soupXmondrian
    # 1 SXM for each GBS hodler, 1 SXM for each (NFS + MND) hodler
    # Max is 2

    # Loop through NFS owners and if they also own MND then allocate 1 SXM
    for a in nfs_owners:
        # Ensure the address is in MND list as well
        if a in mnd_owners:
            # Save in separate list for debugging purposes
            if a not in nfs_mnd_owners:
                nfs_mnd_owners.append(a)
            # Add to the master dict with allocation of 1 if not there
            if a not in master_dict:
                master_dict[a] = "1"

    # Then loop through GBS owners and allocate an extra if needed
    for a in gbs_owners:
        if a not in master_dict:
            master_dict[a] = "1"

        if a in nfs_owners and a in mnd_owners:
            master_dict[a] = "2"

    # Save file
    print(f'[{arrow.now()}] Found {len(gbs_owners)} GBS owners and {len(nfs_mnd_owners)} NFS+MND owners! Storing addresses and SXM allotment for generating merkle tree for distribution.')
    with open('output.json', 'w') as f:
        f.write(json_dumps(master_dict))
