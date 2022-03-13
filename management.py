import json
import os
import pathlib
import subprocess
from typing import Any, Dict

FILE_PATH = pathlib.Path(__file__).parent.resolve()
CLI_DIR_PATH = FILE_PATH
CLI_NAME = 'cli.js'


def call_cli(**kwargs) -> Dict[str, Any]:
    commands = []
    for k, v in kwargs.items():
        if v is not None:
            commands.append(f'--{k}')
            commands.append(v)
    env = os.environ.copy()
    process = subprocess.run(['node', CLI_NAME, *commands], capture_output=True, shell=True, cwd=CLI_DIR_PATH, env=env)
    out, err = process.stdout, process.stderr
    success = False
    data = err
    if not err:
        try:
            pre_data = json.loads(out)
            if pre_data['success']:
                success = True
                data = pre_data['data']
        except BaseException as ex:
            success = False
            data = err
    return {
        'success': success,
        'data': data
    }


def create_wallet():
    return call_cli(func='createWallet')


def estimate_deploy_fee(public_key, secret_key):
    return call_cli(func='estimateDeployFee', public_key=public_key, secret_key=secret_key)


def deploy_wallet(public_key, secret_key):
    return call_cli(func='deployWallet', public_key=public_key, secret_key=secret_key)


def estimate_transfer_fee(
    public_key,
    secret_key,
    to_address,
    amount=0,
    payload='Hello from Insomnia keeper',
    send_mode=3
):
    return call_cli(
        func='estimateTransferFee',
        public_key=public_key,
        secret_key=secret_key,
        to_address=to_address,
        amount=amount,
        payload=payload,
        send_mode=send_mode,
    )


def transfer(public_key, secret_key, to_address, amount=0, payload='Hello from Insomnia keeper', send_mode=3):
    return call_cli(
        func='transfer',
        public_key=public_key,
        secret_key=secret_key,
        to_address=to_address,
        amount=amount,
        payload=payload,
        send_mode=send_mode,
    )


def get_history(address):
    return call_cli(func='getHistory', address=address)


def get_balance(address):
    return call_cli(func='getBalance', address=address)
