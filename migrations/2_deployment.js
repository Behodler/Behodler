const Scarcity = artifacts.require('Scarcity')
const Lachesis = artifacts.require('Lachesis')
const Behodler = artifacts.require('Behodler')
const MockToken1 = artifacts.require('MockToken1')
const MockToken2 = artifacts.require('MockToken2')
const MockToken3 = artifacts.require('MockToken3')
const MockToken4 = artifacts.require('MockToken4')
const MockInvalidToken = artifacts.require('MockInvalidToken')
const MockWeth = artifacts.require('MockWeth')
const Kharon = artifacts.require('Kharon')
const Prometheus = artifacts.require('Prometheus')
const Janus = artifacts.require('Janus')
const Chronos = artifacts.require('Chronos')
const Bellows = artifacts.require('Bellows')
const Registry = artifacts.require('PyroTokenRegistry')
const MockBehodler = artifacts.require("MockBehodler")
const messageObjectFileLocation = '../messageLocation.json'
const fs = require('fs')
const seed = true
module.exports = async function (deployer, network, accounts) {
	var scarcityInstance, lachesisInstance, behodlerInstance, mock1Instance, mock2Instance, mock3Instance, mock4Instance, mockWethInstance, mockInvalidTokenInstance
	var kharonInstance, prometheusInstance, janusInstance, chronosInstance, bellowsInstance, registryInstance, mockBehodlerInstance
	let contractList = []
	await pausePromise('scarcity pause')
	await deployer.deploy(Scarcity)
	await pausePromise('Lachesis pause')
	await deployer.deploy(Lachesis)
	await pausePromise('Behodler pause')
	await deployer.deploy(Behodler)
	await pausePromise('Kharon pause')
	await deployer.deploy(Kharon)
	await pausePromise('Prometheus pause')
	await deployer.deploy(Prometheus)
	await pausePromise('Janus pause')
	await deployer.deploy(Janus)
	await pausePromise('Chronos pause')
	await deployer.deploy(Chronos)
	await pausePromise('Bellows pause')
	await deployer.deploy(Bellows)
	await pausePromise('Registry pause')
	await deployer.deploy(Registry)

	scarcityInstance = await Scarcity.deployed()
	console.log('scarcity address: ' + scarcityInstance.address)
	lachesisInstance = await Lachesis.deployed()
	behodlerInstance = await Behodler.deployed()
	kharonInstance = await Kharon.deployed()
	prometheusInstance = await Prometheus.deployed()
	janusInstance = await Janus.deployed()
	chronosInstance = await Chronos.deployed()
	bellowsInstance = await Bellows.deployed()
	registryInstance = await Registry.deployed()

	contractList.push({ name: 'Behodler', address: behodlerInstance.address })
	contractList.push({ name: 'Bellows', address: bellowsInstance.address })
	contractList.push({ name: 'Chronos', address: chronosInstance.address })
	contractList.push({ name: 'Janus', address: janusInstance.address })
	contractList.push({ name: 'Kharon', address: kharonInstance.address })
	contractList.push({ name: 'Lachesis', address: lachesisInstance.address })
	contractList.push({ name: 'Prometheus', address: prometheusInstance.address })
	contractList.push({ name: 'PyroTokenRegistry', address: registryInstance.address })
	contractList.push({ name: 'Scarcity', address: scarcityInstance.address })
	contractList.push({ name: 'PyroToken', address: '' })

	if (seed) {
		await pausePromise('Seeding behodler')
		await behodlerInstance.seed(lachesisInstance.address, kharonInstance.address, janusInstance.address, chronosInstance.address)
		await pausePromise('Seeding Chronos')
		await chronosInstance.seed(behodlerInstance.address)
		await pausePromise('Seeding scarcity')
		await scarcityInstance.setBehodler(behodlerInstance.address)
		await pausePromise('Seeding lachesis')
		await lachesisInstance.setScarcity(scarcityInstance.address)
		await pausePromise('Seeding registry')
		await registryInstance.seed(bellowsInstance.address, lachesisInstance.address, kharonInstance.address)
		await pausePromise('Seeding bellows')
		await bellowsInstance.seed(lachesisInstance.address, registryInstance.address)
	}


	let bankAddress = '', daiAddress = '', weiDaiAddress = '', preAddress, donationAddress = '', wethAddress = ''
	if (network === 'development') {

		let contracts = JSON.parse(fs.readFileSync(messageObjectFileLocation))
		daiAddress = contracts.dai;
		weiDaiAddress = contracts.weiDai;
		bankAddress = contracts.bank
		preAddress = contracts.pre

		await deployer.deploy(MockToken1)
		await deployer.deploy(MockToken2)
		await deployer.deploy(MockToken3)
		await deployer.deploy(MockToken4)
		await deployer.deploy(MockInvalidToken)
		await deployer.deploy(MockWeth)
		await deployer.deploy(MockBehodler)


		mock1Instance = await MockToken1.deployed()
		mock2Instance = await MockToken2.deployed()
		mock3Instance = await MockToken3.deployed()
		mock4Instance = await MockToken4.deployed()

		mockWethInstance = await MockWeth.deployed()
		mockInvalidTokenInstance = await MockInvalidToken.deployed()
		mockBehodlerInstance = await MockBehodler.deployed()
		wethAddress = mockWethInstance.address

		donationAddress = accounts[5]

		contractList.push({ name: 'MockToken1', address: mock1Instance.address })
		contractList.push({ name: 'MockToken2', address: mock2Instance.address })
		contractList.push({ name: 'MockToken3', address: mock3Instance.address })
		contractList.push({ name: 'MockToken4', address: mock4Instance.address })
		contractList.push({ name: 'MockWeth', address: mockWethInstance.address })
		contractList.push({ name: 'MockBehodler', address: mockBehodlerInstance.address })
		contractList.push({ name: 'ERC20', address: daiAddress })

		await mockBehodlerInstance.seed(kharonInstance.address, scarcityInstance.address)

		await lachesisInstance.measure(mock1Instance.address, true)
		await lachesisInstance.measure(mock2Instance.address, true)
		await lachesisInstance.measure(mock3Instance.address, true)
		await lachesisInstance.measure(mock4Instance.address, true)
		await lachesisInstance.measure(mockWethInstance.address, true)

		await registryInstance.addToken("pyroMock1", "PMC1", mock1Instance.address)
		await registryInstance.addToken("pyroMock2", "PMC2", mock2Instance.address)
		await registryInstance.addToken("pyroMock3", "PMC3", mock3Instance.address)
		await registryInstance.addToken("pyroMock4", "PMC4", mock4Instance.address)
		await registryInstance.addToken("pyroWeth", "PWeth", mockWethInstance.address)

	}
	else if (network == 'kovan-fork' || network == 'kovan') {

	}
	else {//if (network === 'main' || network == 'main-fork') {
		daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
		weiDaiAddress = '0xaFEf0965576070D1608F374cb14049EefaD218Ec'
		bankAddress = '0x30374E46d3E3faf57CE0dAdc5D28b44AE27216bc'
		preAddress = '0x2b645e669Fb54A7877dCFd6BaC1bc1790a3e5e8c'

		donationAddress = '0x9b044074699d97910A28dC8E3831faf8f76A9c37'

		const OXT = '0x4575f41308ec1483f3d399aa9a2826d74da13deb'
		const PNK = '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d'
		wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
		const Link = '0x514910771af9ca656af840dff83e8264ecf986ca'
		const Loom = '0xa4e8c3ec456107ea67d3075bf9e3df3a75823db0'
		const WBTC = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
		const MAKER = '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'
		const BAT = '0x0d8775f648430679a709e98d2b0cb6250d2887ef'

		if (seed) {
			await pausePromise('adding Orchid')
			await lachesisInstance.measure(OXT, true)
			await registryInstance.addToken("PyroOrc", "POXT", OXT)
			await pausePromise('adding PNK')
			await lachesisInstance.measure(PNK, true)
			await registryInstance.addToken("PyroKleros", "PPNK", PNK)
			await pausePromise('adding Dai')
			await lachesisInstance.measure(daiAddress, true)
			await pausePromise('adding Weth')
			await lachesisInstance.measure(wethAddress, true)
			await registryInstance.addToken("PyroWeth", "PWETH", wethAddress)
			await pausePromise('adding LINK')
			await lachesisInstance.measure(Link, true)
			await registryInstance.addToken("PyroLink", "PLINK", Link)
			await pausePromise('adding WeiDai')
			await lachesisInstance.measure(weiDaiAddress, true)
			await pausePromise('adding LOOM')
			await lachesisInstance.measure(Loom, true)
			await registryInstance.addToken("PyroLoom", "PLOOM", Loom)
			await pausePromise('adding WBTC')
			await lachesisInstance.measure(WBTC, true)
			await registryInstance.addToken("PyroWBTC", "PWBTC", WBTC)
			await pausePromise('adding MAKER')
			await lachesisInstance.measure(MAKER, true)
			await registryInstance.addToken("PyroMAKER", "PMKR", MAKER)
			await pausePromise('adding BAT')
			await lachesisInstance.measure(BAT, true)
			await registryInstance.addToken("PyroBAT", "PBAT", BAT)
		}
	}

	const abiAddressArray = populateAbiArray(contractList)
	writeNetworkABIs(network, abiAddressArray)
	if (seed) {
		await pausePromise('seeding prometheus')
		await prometheusInstance.seed(kharonInstance.address, scarcityInstance.address, weiDaiAddress, daiAddress, registryInstance.address)
		await pausePromise('seeding kharon')
		await kharonInstance.seed(bellowsInstance.address, behodlerInstance.address, prometheusInstance.address, preAddress, bankAddress, daiAddress, weiDaiAddress, scarcityInstance.address, '10000000000000000000000000', donationAddress)
		await pausePromise('seeding janus')
		await janusInstance.seed(scarcityInstance.address, wethAddress, behodlerInstance.address)
	}
	writeScarcityLocationForSisyphus(scarcityInstance.address)
}

function pausePromise(message, durationInSeconds = 1) {
	return new Promise(function (resolve, error) {
		setTimeout(() => {
			console.log(message)
			return resolve()
		}, durationInSeconds * 100)
	})
}

function writeNetworkABIs(network, abiAddressArray) {
	const fileLocation = './BehodlerABIAddressMapping.json'
	const fs = require('fs')
	var exists = fs.existsSync(fileLocation)
	let dataObject = []
	if (exists) {
		try {
			dataObject = JSON.parse(fs.readFileSync(fileLocation))
		} catch{
			dataObject = []
		}
	}
	let found = false
	for (let i = 0; i < dataObject.length; i++) {
		if (dataObject[i].name == network) {
			dataObject[i].list = abiAddressArray
			found = true
		}
	}
	if (!found)
		dataObject.push({ name: network, list: abiAddressArray })
	let output = JSON.stringify(dataObject, null, 4)
	fs.writeFileSync(fileLocation, output)
}

function populateAbiArray(addressArray) {
	const fs = require('fs')
	let baseLocation = './build/contracts/'
	let abiAddressArray = []

	addressArray.forEach((contract) => {
		const abi = JSON.parse(fs.readFileSync(baseLocation + contract.name + '.json')).abi
		abiAddressArray.push({ contract: contract.name, address: contract.address, abi })
	})
	return abiAddressArray
}

function writeScarcityLocationForSisyphus(scx) {
	const scarcityLocation = "/home/justin/weidai ecosystem/Sisyphus/scarcityAddress.txt"
	fs.writeFileSync(scarcityLocation, scx)
}