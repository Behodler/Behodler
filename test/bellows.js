
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle

const test = async.test
const setup = async.setup
const scarcity = artifacts.require("Scarcity")
const mockToken1 = artifacts.require('MockToken1')
const mockToken2 = artifacts.require('MockToken2')
const bellows = artifacts.require('Bellows')
const registry = artifacts.require("PyroTokenRegistry")

let primary = ""
contract('Scarcity', accounts => {
	var scarcityInstance, mock1Instance, mock2Instance, bellowsInstance, registryInstance
	setup(async () => {
		scarcityInstance = await scarcity.deployed()
		mock1Instance = await mockToken1.deployed()
		mock2Instance = await mockToken2.deployed()
		bellowsInstance = await bellows.deployed()
		registryInstance = await registry.deployed()
		primary = accounts[0]
	})

	test("blast of non pyrotoken fails", async () => {
	
	})

	test("blast of non pyrotoken generates new pyrotokens for sender", async () => {
	
	})

	test("open for non registered token fails", async () => {
	
	})

	test("open increases redeem rate", async () => {
	
	})
})