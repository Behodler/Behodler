
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle

const test = async.test
const setup = async.setup
const scarcity = artifacts.require("Scarcity")
const behodler = artifacts.require('Behodler')
const mockToken1 = artifacts.require('MockToken1')
const mockToken2 = artifacts.require('MockToken2')

let primary = ""
contract('Scarcity', accounts => {
	var scarcityInstance, behodlerInstance, mock1Instance, mock2Instance
	setup(async () => {
		scarcityInstance = await scarcity.deployed()
		behodlerInstance = await behodler.deployed()
		mock1Instance = await mockToken1.deployed()
		mock2Instance = await mockToken2.deployed()
		
		primary = accounts[0]
	})


	test("trade between same token fails", async () => {
	
	})

	test("Eth to token should increase weth balance", async () => {
	
	})


	test("token to eth should increase eth balance", async () => {
	
	})

	test("repeated back and forth trade should decrease slippage per trade", async () => {
	
	})

	test("repeated back and forth trade should increase scarcity price of both tokens", async () => {

	})
})