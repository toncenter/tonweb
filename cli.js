const arg = require('arg');
const TonWeb = require('.');


const uint8ArrayToHex = (uint8Array) => Buffer.from(uint8Array).toString('hex')
const uint8ArrayFromHex = (hexString) => Uint8Array.from(Buffer.from(hexString, 'hex'))



class Wallet {
  constructor() {
    this.nacl = TonWeb.utils.nacl
    this.tonweb = new TonWeb()
  }
  
  address = () => {
    return uint8ArrayToHex(this.uint8ArrData.address)
  }
  publicKey = () => {
    return uint8ArrayToHex(this.uint8ArrData.publicKey)
  }
  secretKey = () => {
    return uint8ArrayToHex(this.uint8ArrData.secretKey)
  }
  
  __connectUint8 = async (publicKey, secretKey) => {
    this.wallet = this.tonweb.wallet.create({publicKey, wc: 0})
    this.seqno = await this.wallet.methods.seqno().call()
    this.uint8ArrData = {
      address: (await this.wallet.getAddress()).hashPart,
      publicKey: publicKey,
      secretKey: secretKey,
    }
  }
  
  __checkConnected = () => {
    if (!this.uint8ArrData.publicKey) throw Error('No public key entered, please call "connect"')
    if (!this.uint8ArrData.secretKey) throw Error('No secret key entered, please call "connect"')
    if (!this.wallet) throw Error('No wallet connected, please call "connect"')
    if (!this.seqno) throw Error('No seqno, please call "connect"')
  }
  
  create = async () => {
    const keyPair = this.nacl.sign.keyPair()
    await this.__connectUint8(keyPair.publicKey, keyPair.secretKey)
    return {
      publicKey: this.publicKey(),
      secretKey: this.secretKey(),
      address: this.address(),
      seqno: this.seqno,
    }
  }
  
  connect = async (publicKey, secretKey) => {
    await this.__connectUint8(uint8ArrayFromHex(publicKey), uint8ArrayFromHex(secretKey))
    return {
      publicKey: this.publicKey(),
      secretKey: this.secretKey(),
      address: this.address(),
    }
  }
  
  disconnect = () => {
    this.uint8ArrData = null
    this.seqno = null
    this.wallet = null
  }
  
  reconnect = async () => {
    return await this.connect(this.publicKey(), this.secretKey())
  }
  
  deploy = async () => {
    this.__checkConnected()
    return await this.wallet.deploy(this.uint8ArrData.secretKey).send()
  }
  
  estimateDeployFee = async () => {
    this.__checkConnected()
    return await this.wallet.deploy(this.uint8ArrData.secretKey).estimateFee()
  }
  
  __createTransfer = (toAddress, amount, payload = 'Hello', sendMode = 3) => {
    this.__checkConnected()
    if (!toAddress) {
      throw Error('No "toAddress" entered')
    }
    if (amount <= 0) {
      throw Error('Please enter positive amount')
    }
    return this.wallet.methods.transfer({
      secretKey: this.uint8ArrData.secretKey,
      seqno: this.seqno,
      toAddress,
      amount: TonWeb.utils.toNano(amount),
      payload,
      sendMode,
    })
  }
  
  estimateTransferFee = async (toAddress, amount, payload = 'Hello', sendMode = 3) => {
    this.__createTransfer(toAddress, amount, payload, sendMode)
    return await transfer.estimateFee()
  }
  
  transfer = async (toAddress, amount, payload = 'Hello', sendMode = 3) => {
    this.__createTransfer(toAddress, amount, payload, sendMode)
    return await transfer.send()
  }
  
  getHistory = async (address = null) => {
    address = (address ? uint8ArrayFromHex(address) : this.uint8ArrData.address)
    if (!address) throw Error('No address specified')
    return await this.tonweb.getTransactions(address)
  }
  
  getBalance = async (address = null) => {
    address = (address ? uint8ArrayFromHex(address) : this.uint8ArrData.address)
    if (!address) throw Error('No address specified')
    return await this.tonweb.getBalance(address)
  }
}


const wallet = () => new Wallet()

const createWallet = async () => await wallet().create()

const deployWallet = async ({
  publicKey,
  secretKey
}) => await wallet().connect(publicKey, secretKey).deploy()

const estimateDeployFee = async ({
  publicKey,
  secretKey
}) => await wallet().connect(publicKey, secretKey).estimateDeployFee()

const estimateTransferFee = async ({
  publicKey,
  secretKey,
  toAddress,
  amount = 0,
  payload = 'Hello',
  sendMode = 3
}) => await wallet().connect(publicKey, secretKey).estimateTransferFee(toAddress, amount, payload, sendMode)

const transfer = async ({
  publicKey,
  secretKey,
  toAddress,
  amount = 0,
  payload = 'Hello',
  sendMode = 3
}) => await wallet().connect(publicKey, secretKey).transfer(toAddress, amount, payload, sendMode)

const getHistory = async ({address}) => await wallet().getHistory(address)

const getBalance = async ({address}) => await wallet().getBalance(address)


const args = arg({
	'--func': String,
	'--publicKey': String,
	'--secretKey': String,
	'--toAddress': String,
	'--amount': Number,
	'--payload': String,
	'--sendMode': Number,
})

funcToFunction = {
	createWallet,
	deployWallet,
	estimateDeployFee,
	estimateTransferFee,
	transfer,
	getHistory,
	getBalance,
}

const runCli = async () => {
	try {
		let realArgs = {}
		Object.keys(args).forEach(argKey => {
			let newArgKey = argKey.replace('--', '')
			realArgs[newArgKey] = args[argKey]
		})
		if (Object.keys(funcToFunction).indexOf(realArgs.func) !== -1) {
			const func = funcToFunction[realArgs.func]
			const res = await func(realArgs)
			return res
		}
	} catch (e) {
	
	}
	return false
}

runCli().then((result) => {
	let output = JSON.stringify({
		success: false
	})
	if (result) {
		output = JSON.stringify({
			success: true,
			data: result
		})
	}
	console.log(output)
})