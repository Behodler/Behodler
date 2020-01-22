
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

	test("calculateAverageScarcityPerToken with zero value should fail", async () => {
		await expectThrow(behodlerInstance.calculateAverageScarcityPerToken(mock2Instance.address, "0", { from: primary }), 'Non-zero token value expected to avoid division by zero.')
	})

	test("buy with non tradeable token should fail", async () => {
	
	})

	test("buy should increase scarcity price of token", async () => {
	
	})

	test("sell should decrease scarcity price of token", async () => {
	
	})


	test("repeated back and forth trade should increase scarcity price of both tokens", async () => {
	
	})

	test("repeated back and forth trade should decrease slippage per trade", async () => {
	
	})

	test("buying so much that no scarcity is printed should fail", async () => {
	
	})

	test("buy with too much slippage should fail", async () => {
	
	})

	test("sell with too much slippage should fail", async () => {
	
	})

	test("buy should exact a fee from Kharon and a reward in pyrotokens", async () => {
	
	})

	test ("sell should burn scarcity", async()=>{

	})

	test ("setting slippage to zero should ignore all slippage", async()=>{

	})
})