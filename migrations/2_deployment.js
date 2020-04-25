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
const messageObjectFileLocation = '../messageLocation.json'
const fs = require('fs')

module.exports = async function (deployer, network, accounts) {
	var scarcityInstance, lachesisInstance, behodlerInstance, mock1Instance, mock2Instance, mockWethInstance, mockInvalidTokenInstance
	var kharonInstance, prometheusInstance, janusInstance, chronosInstance, bellowsInstance, registryInstance, mockBehodlerInstance
	let contractList = []
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

	await behodlerInstance.seed(lachesisInstance.address, kharonInstance.address, janusInstance.address, chronosInstance.address)
	await chronosInstance.seed(behodlerInstance.address)
	await scarcityInstance.setBehodler(behodlerInstance.address)
	await lachesisInstance.setScarcity(scarcityInstance.address)
	await registryInstance.seed(bellowsInstance.address, lachesisInstance.address, kharonInstance.address)
	await bellowsInstance.seed(lachesisInstance.address, registryInstance.address)

	let bankAddress = '', daiAddress = '', weiDaiAddress = '', preAddress, donationAddress = '', wethAddress = ''
	if (network === 'development') {

		let contracts = JSON.parse(fs.readFileSync(messageObjectFileLocation))
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

		contractList.push({ name: 'MockToken1', address: mock1Instance.address })
		contractList.push({ name: 'MockToken2', address: mock2Instance.address })
		contractList.push({ name: 'MockWeth', address: mockWethInstance.address })
		contractList.push({ name: 'MockBehodler', address: mockBehodlerInstance.address })
		contractList.push({ name: 'ERC20', address: daiAddress })

		await mockBehodlerInstance.seed(kharonInstance.address, scarcityInstance.address)

		await lachesisInstance.measure(mock1Instance.address, true)
		await lachesisInstance.measure(mock2Instance.address, true)
		await lachesisInstance.measure(mockWethInstance.address, true)

		await registryInstance.addToken("pyroMock1", "PMC1", mock1Instance.address)
		await registryInstance.addToken("pyroMock2", "PMC2", mock2Instance.address)
		await registryInstance.addToken("pyroWeth", "PWeth", mockWethInstance.address)

	}
	else if (network === 'main' || network == 'main-fork') {

	}
	else if (network == 'kovan-fork' || network == 'kovan') {

	}
	const abiAddressArray = populateAbiArray(contractList)
	writeNetworkABIs(network, abiAddressArray)
	await prometheusInstance.seed(kharonInstance.address, scarcityInstance.address, weiDaiAddress, daiAddress, registryInstance.address)
	await kharonInstance.seed(bellowsInstance.address, behodlerInstance.address, prometheusInstance.address, preAddress, bankAddress, daiAddress, weiDaiAddress, scarcityInstance.address, '10000000000000000000', donationAddress)
	await janusInstance.seed(scarcityInstance.address, wethAddress, behodlerInstance.address)
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