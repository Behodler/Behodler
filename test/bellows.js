
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const pyroTokenABI = require('./PyroToken.json').abi

const test = async.test
const setup = async.setup
const scarcity = artifacts.require("Scarcity")
const mockToken1 = artifacts.require('MockToken1')
const mockToken2 = artifacts.require('MockToken2')
const mockInvalidToken = artifacts.require('MockInvalidToken')
const bellows = artifacts.require('Bellows')
const registry = artifacts.require("PyroTokenRegistry")

let primary = ""
contract('Bellows', accounts => {
	var  mock1Instance, bellowsInstance, registryInstance, mockInvalidTokenInstance
	setup(async () => {
		scarcityInstance = await scarcity.deployed()
		mock1Instance = await mockToken1.deployed()
		mock2Instance = await mockToken2.deployed()
		mockInvalidTokenInstance = await mockInvalidToken.deployed()
		bellowsInstance = await bellows.deployed()
		registryInstance = await registry.deployed()
		primary = accounts[0]
	})

	test("open for non registered token fails", async () => {
		await expectThrow(bellowsInstance.open(mockInvalidTokenInstance.address, '200'), "Token doesn't exist.")
	})

	test("open when pyro supply zero fails", async () => {
		const pyroTokenAddress = await registryInstance.baseTokenMapping.call(mock1Instance.address)
		const redeemRateBefore = (await bellowsInstance.getRedeemRate.call(pyroTokenAddress)).toString()
		assert.equal(redeemRateBefore, "100")

		await expectThrow(bellowsInstance.open(mock1Instance.address, "100"), "bellow cannot be opened before pyrotokens minted");
	})

	test("open increases redeem rate, blast sends ", async () => {
		const pyroTokenAddress = await registryInstance.baseTokenMapping.call(mock1Instance.address)
		const redeemRateBefore = (await bellowsInstance.getRedeemRate.call(pyroTokenAddress)).toString()
		assert.equal(redeemRateBefore, "100")
		const pyroTokenInstance = (await new web3.eth.Contract(pyroTokenABI, pyroTokenAddress)).methods

		await mock1Instance.approve(pyroTokenAddress, "100000", { from: accounts[0] })
		const pyroBalanceBefore = (await pyroTokenInstance.balanceOf(accounts[0]).call()).toString()
		assert.equal(pyroBalanceBefore, "0")
		await pyroTokenInstance.engulf(accounts[0], "100").send({ from: accounts[0], gas: "0x691b7" })
		const pyroBalanceAfter = (await pyroTokenInstance.balanceOf(accounts[0]).call()).toString()
		assert.equal(pyroBalanceAfter, "10000")

		const redeemRateAfterEngulf = (await bellowsInstance.getRedeemRate.call(pyroTokenAddress)).toString()
		assert.equal(redeemRateAfterEngulf, "100")

		await mock1Instance.approve(bellowsInstance.address, "100")
		await bellowsInstance.open(mock1Instance.address, "100")
		const redeemRateAfterOpen = (await bellowsInstance.getRedeemRate.call(pyroTokenAddress)).toString()
		assert.equal(redeemRateAfterOpen, "200")

		await pyroTokenInstance.transfer(accounts[1], "10000").send({ from: accounts[0] });
		const balanceOfBaseForUser2Before = (await mock1Instance.balanceOf(accounts[1])).toString()
		assert.equal(balanceOfBaseForUser2Before, "0")

		await pyroTokenInstance.approve(bellowsInstance.address, "1000").send({ from: accounts[1] })
		await bellowsInstance.blast(pyroTokenAddress, "1000", { from: accounts[1] })
		const balanceOfBaseForUser2After = (await mock1Instance.balanceOf(accounts[1])).toString()
		assert.equal(balanceOfBaseForUser2After, "18")
		
		const redeemRateAfterBlast = (await bellowsInstance.getRedeemRate.call(pyroTokenAddress)).toString()
		assert.equal(redeemRateAfterBlast, "200")
	})

	test("blast of non pyrotoken fails", async () => {
		await expectThrow(bellowsInstance.blast(mockInvalidTokenInstance.address, "100"), "PyroToken doesn't exist.")
	})
})