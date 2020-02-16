
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

	test("calling chronos without behodler fails", async () => {
	
	})

	test("adding 9 points fo data should leave averages the same", async () => {
	
	})

	test("20 points of data should change first but leave second two the same", async () => {
	
	})

	test("200 points of data should change first and second but leave third accurate", async () => {
	
	})

	test("2000 points of data should distort all 3", async () => {
	
	})

	test(`adding 1000 points of same data and then a massive outlier 
	should distort 10 by more than 100 by more than 1000`, async () => {
	
	})
	
})