const TonWeb = require("./index");

console.log(TonWeb.utils.formatTransferUrl('EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG'))
console.log(TonWeb.utils.formatTransferUrl('EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG', '12300000000'))
console.log(TonWeb.utils.formatTransferUrl('EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG', '12300000000', 'hello'))
console.log(TonWeb.utils.formatTransferUrl('EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG', '12300000000', 'https://ton.org'))
console.log(TonWeb.utils.formatTransferUrl('EQBvI0aFLnw2QbZgjMPCLRdtRHxhUyinQudg6sdiohIwg5jL', undefined, ' ?&'))

console.log(TonWeb.utils.parseTransferUrl('ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG'));
console.log(TonWeb.utils.parseTransferUrl('ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG?amount=12300000000'));
console.log(TonWeb.utils.parseTransferUrl('ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG?amount=12300000000&text=hello'));
console.log(TonWeb.utils.parseTransferUrl('ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG?amount=12300000000&text=https%3A%2F%2Fton.org'));
console.log(TonWeb.utils.parseTransferUrl('ton://transfer/EQBvI0aFLnw2QbZgjMPCLRdtRHxhUyinQudg6sdiohIwg5jL?text=%20%3F%26'));
console.log(TonWeb.utils.parseTransferUrl('ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG?amount=123.3'));


