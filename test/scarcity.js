
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle

const test = async.test
const setup = async.setup
const scarcity = artifacts.require("Scarcity")
let primary = ""
contract('Scarcity', accounts => {
	var scarcityInstance
	setup(async () => {
		scarcityInstance = await scarcity.deployed()
		primary = accounts[0]
	})

	test("mint by not Behodler", async () => {
		await expectThrow(scarcityInstance.mint(accounts[1], "100", { from: primary }), 'Only the Behodler contract can invoke this function.')
	})
})