const TonWeb = require('./index');

async function init() {
	const tonweb = new TonWeb();
	const TOKEN_ADDRESS =
		'0:9c2c05b9dfb2a7460fda48fae7409a32623399933a98a7a15599152f37572b49';
	const result = await tonweb.provider.getTokenData(TOKEN_ADDRESS);
	console.log(result);
}

init();
