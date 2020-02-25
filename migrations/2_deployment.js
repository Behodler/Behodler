const Scarcity = artifacts.require('Scarcity')
const Lachesis = artifacts.require('Lachesis')
const Behodler = artifacts.require('Behodler')
const MockToken1 = artifacts.require('MockToken1')
const MockToken2 = artifacts.require('MockToken2')
const MockInvalidToken = artifacts.require('MockInvalidToken')
const MockWeth = artifacts.require('MockWeth')
const Kharon = artifacts.require('Kharon')
const Prometheus = artifacts.require('Prometheus')
const Janus = artifacts.require('Janus')
const Chronos = artifacts.require('Chronos')
const Bellows = artifacts.require('Bellows')
const Registry = artifacts.require('PyroTokenRegistry')
const MockBehodler = artifacts.require("MockBehodler")

module.exports = async function (deployer, network, accounts) {
	var scarcityInstance, lachesisInstance, behodlerInstance, mock1Instance, mock2Instance, mockWethInstance, mockInvalidTokenInstance
	var kharonInstance, prometheusInstance, janusInstance, chronosInstance, bellowsInstance, registryInstance, mockBehodlerInstance

	await deployer.deploy(Scarcity)
	await deployer.deploy(Lachesis)
	await deployer.deploy(Behodler)
	await deployer.deploy(Kharon)
	await deployer.deploy(Prometheus)
	await deployer.deploy(Janus)
	await deployer.deploy(Chronos)
	await deployer.deploy(Bellows)
	await deployer.deploy(Registry)

	scarcityInstance = await Scarcity.deployed()
	lachesisInstance = await Lachesis.deployed()
	behodlerInstance = await Behodler.deployed()
	kharonInstance = await Kharon.deployed()
	prometheusInstance = await Prometheus.deployed()
	janusInstance = await Janus.deployed()
	chronosInstance = await Chronos.deployed()
	bellowsInstance = await Bellows.deployed()
	registryInstance = await Registry.deployed()

	await behodlerInstance.seed(lachesisInstance.address, kharonInstance.address, janusInstance.address, chronosInstance.address)
	await chronosInstance.seed(behodlerInstance.address)
	await scarcityInstance.setBehodler(behodlerInstance.address)
	await lachesisInstance.setScarcity(scarcityInstance.address)
	await registryInstance.seed(bellowsInstance.address, lachesisInstance.address, kharonInstance.address)
	await bellowsInstance.seed(lachesisInstance.address, registryInstance.address)

	let bankAddress = '', daiAddress = '', weiDaiAddress = '', preAddress, donationAddress = '', wethAddress = ''
	if (network === 'development') {
		let contracts =
		{
			"dai": "0xB9f5A0Ad0B8F3b3C704C9b071f753F73Cc8843bE",
			"weiDai": "0x8a16E29CaC5e50c9aa2a497589a02004e83e10e2",
			"bank": "0x156E7b05073A8AD3C867b1362bb917696dCCA3f2",
			"pre": "0x4Cfde611c84E2318C01092Ade351479b71164203"
		}
		daiAddress = contracts.dai;
		weiDaiAddress = contracts.weiDai;
		bankAddress = contracts.bank
		preAddress = contracts.pre

		await deployer.deploy(MockToken1)
		await deployer.deploy(MockToken2)
		await deployer.deploy(MockInvalidToken)
		await deployer.deploy(MockWeth)
		await deployer.deploy(MockBehodler)

		mock1Instance = await MockToken1.deployed()
		mock2Instance = await MockToken2.deployed()
		mockWethInstance = await MockWeth.deployed()
		mockInvalidTokenInstance = await MockInvalidToken.deployed()
		mockBehodlerInstance = await MockBehodler.deployed()
		wethAddress = mockWethInstance.address

		donationAddress = accounts[5]

		await mockBehodlerInstance.seed(kharonInstance.address, scarcityInstance.address)

		await lachesisInstance.measure(mock1Instance.address, true)
		await lachesisInstance.measure(mock2Instance.address, true)
		await lachesisInstance.measure(mockWethInstance.address, true)

		await registryInstance.addToken("pyroMock1", "PMC1", mock1Instance.address)
		await registryInstance.addToken("pyroMock2", "PMC2", mock2Instance.address)

	}
	else if (network === 'main' || network == 'main-fork') {

	}
	else if (network == 'kovan-fork' || network == 'kovan') {

	}
	await prometheusInstance.seed(kharonInstance.address, scarcityInstance.address, weiDaiAddress, daiAddress, registryInstance.address)
	await kharonInstance.seed(bellowsInstance.address, behodlerInstance.address, prometheusInstance.address, preAddress, bankAddress, daiAddress,weiDaiAddress, scarcityInstance.address, '10000000000000000000', donationAddress)
	await janusInstance.seed(scarcityInstance.address, wethAddress, behodlerInstance.address)
}
