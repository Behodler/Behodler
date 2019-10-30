const Scarcity = artifacts.require('Scarcity')
const Validator = artifacts.require('Validator')
const Behodler = artifacts.require('Behodler')
const MockToken1 = artifacts.require('MockToken1')
const MockToken2 = artifacts.require('MockToken2')
const Weth = artifacts.require('Weth')

module.exports = async function (deployer, network, accounts) {
	var scarcityInstance, validatorInstance,behodlerInstance, mock1Instance, mock2Instance, wethInstance

	await deployer.deploy(Scarcity)
	await deployer.deploy(Validator)
	await deployer.deploy(Behodler)


	scarcityInstance = await Scarcity.deployed()
	validatorInstance = await Validator.deployed()
	behodlerInstance = await Behodler.deployed();

	if (network === 'development') {
		await deployer.deploy(MockToken1)
		await deployer.deploy(MockToken2)
		await deployer.deploy(Weth)
		
		mock1Instance = await MockToken1.deployed()
		mock2Instance = await MockToken2.deployed()
		wethInstance = await Weth.deployed()

		await scarcityInstance.setBehodler(behodlerInstance.address)
		await behodlerInstance.setValidator(validatorInstance.address)
		await validatorInstance.setScarcity(scarcityInstance.address)
		await validatorInstance.setValidTokens(mock1Instance.address,mock2Instance.address,wethInstance.address,true)
	}
	else if (network === 'main' || network=='main-fork') {
		
	}
	else if (network == 'kovan-fork' || network == 'kovan') {
		
	}
}
