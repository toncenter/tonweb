# Wallet with lockup

## Wallet operation

Lockup-capable wallet is similar to a standard wallet:
* it can receive coins in a usual manner,
* it can send coins using compatible messages.

However, internally it keeps track of 3 categories of balances:

1. **Liquid** coins, which can be spent unconditionally.
2. **Locked** coins, which can be spent after a timelock expires.
3. **Restricted** coins, which can be spent after a timelock OR onto a whitelisted address.

When the user tries to spend coins, the contract first checks which coins can be made liquid
(i.e. whose timelocks are satisfied). 

If the user tries to spend more than currently available, their message will fail.

## Locked vs restricted balances

Locked and restricted coins are not two pools of coins,
but two categories of multiple pools each, which each pool having its own timelock.

Locked coins are available for spending only after the respective timestamps are reached.

Restricted coins are similar to the locked ones, but allow overriding timelocks via whitelisted destinations.

## Specifying conditions

Timelock conditions are specified in the incoming messages that deliver coins to the contract.

Unlike timelocks, whitelisted addresses are specified at the setup time and cannot be modified.

Only designated "funder" authenticated via `config_public_key` can add locked coins to the wallet with specified timelocks.
Arbitrary users may send regular messages that fund the wallet, adding to its liquid (unrestricted) coins.

## Inspecting the wallet

If the funder wishes to provide coins with a timelock condition, they need to verify the contents of the destination wallet:

1. The hash of the contract must match the expected one to guarantee the behavior.
2. The funder key (`config_public_key`) should be available to the funder.
3. The whitelisted addresses must all be permitted by the funder.

## Deploy parameters

* Public key of the owner (like in a standard wallet).
* Public key of the funder who is capable of adding locked and restricted coins.
* Whitelisted addresses where restricted coins can be sent.

In tonweb, the wallet is instantiated with the following JSON

```
{
    wallet_type: "lockup-0.1",
    workchain: 0, // use -1 for masterchain if you need validator/elector in the whitelist
    config_pubkey: <base64-encoded pubkey>,
    allowed_destinations: <base64-encoded BoC representation of the whitelisted addresses>
}
```

## UI

#### Create wallet

The wallet is set up with [deploy parameters](#deploy-parameters).

#### Restore wallet

To restore the wallet, we need to instantiate the contract with exactly the same [deploy parameters](#deploy-parameters).

#### Balance display

The wallet must show three balances (sum of these three = total amount of coins on the account):

* liquid
* locked
* restricted

Get methods of the contract recalculate liquid balance according to the current time on the node.
For the tonweb client that would be the time of the toncenter backend.

#### Sending

When spending more that the liquid amount - estimated fee,
the wallet must warn that if the conditions are not met (destination or timelock),
the tx would fail, but fee would be charged nonetheless.

#### Receiving

The wallet shows address as usual, liquid balance can be increased via standard wallets.

Funding the wallet with custom timelocks is out of scope for this implementation at the time.
This can be performed by specialized software.

