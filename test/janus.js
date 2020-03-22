
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle

const test = async.test
const setup = async.setup
const scarcity = artifacts.require("Scarcity")
const behodler = artifacts.require('Behodler')
const mockToken1 = artifacts.require('MockToken1')
const mockToken2 = artifacts.require('MockToken2')
const janus = artifacts.require("Janus")
const weth = artifacts.require('MockWeth')

let primary = ""
contract('Scarcity', accounts => {
	const primaryOptions = { from: accounts[0], gas: "0x6091b7" }
	var scarcityInstance, behodlerInstance, mock1Instance, mock2Instance, janusInstance, wethInstance
	setup(async () => {
		scarcityInstance = await scarcity.deployed()
		behodlerInstance = await behodler.deployed()
		mock1Instance = await mockToken1.deployed()
		mock2Instance = await mockToken2.deployed()
		janusInstance = await janus.deployed()
		wethInstance = await weth.deployed()
		primary = accounts[0]
	})


	test("trade between same token fails", async () => {
		const amountToTrade = web3.utils.toWei("10")
		await mock1Instance.approve(behodlerInstance.address, amountToTrade)
		await expectThrow(janusInstance.tokenToToken(mock1Instance.address, mock1Instance.address, 10, 10, 10), "input token must be different to output token")
	})

	test("Eth to token should increase weth balance", async () => {
		let amountToBuy = web3.utils.toWei("1")

		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);

		await wethInstance.approve(behodlerInstance.address, amountToBuy)

		//assert eth balance before and after
		//assert token balance before and after
		const ethBalanceBefore = parseInt(web3.utils.fromWei(await web3.eth.getBalance(accounts[0])))
		assert.equal(ethBalanceBefore, 99)

		const mock1BalanceBefore = await mock1Instance.balanceOf(primary)
		assert.equal(mock1BalanceBefore.toString(), "999999999000000000000000000")

		await janusInstance.ethToToken(mock1Instance.address, 0, amountToBuy, { from: accounts[0], value: amountToBuy })

		const ethBalanceAfter = parseInt(web3.utils.fromWei(await web3.eth.getBalance(accounts[0])))
		assert.equal(ethBalanceAfter, 98)

		const mock1BalanceAfter = await mock1Instance.balanceOf(primary)
		assert.equal(mock1BalanceAfter.toString(), "999999999975437824000000000")

		const difference = (mock1BalanceAfter.sub(mock1BalanceBefore)).toString()
		assert.equal(difference, "975437824000000000")


		const averageScxPerMock1 = await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, 100000000)
		const averageScxPerWeht = await behodlerInstance.calculateAverageScarcityPerToken(wethInstance.address, 100000000)

		assert.equal(averageScxPerMock1.toString(), "389003539540")
		assert.equal(averageScxPerWeht.toString(), "9336085353")

		const tokenToTradeInForWeth = difference

		await mock1Instance.approve(behodlerInstance.address, tokenToTradeInForWeth)
		await scarcityInstance.approve(behodlerInstance.address, web3.utils.toWei(tokenToTradeInForWeth))
		await wethInstance.approve(janusInstance.address, web3.utils.toWei(tokenToTradeInForWeth))

		const ethBalanceBeforeTokenToEth = await web3.eth.getBalance(accounts[0])

		await janusInstance.tokenToEth(mock1Instance.address, tokenToTradeInForWeth, 0, web3.utils.toWei(tokenToTradeInForWeth), primaryOptions)

		const ethBalanceAfterTokenToEth = await web3.eth.getBalance(accounts[0])
		assert.equal(parseInt(web3.utils.fromWei(ethBalanceBeforeTokenToEth)), "98")
		assert.equal(parseInt(web3.utils.fromWei(ethBalanceAfterTokenToEth.toString())), "99")


		//TODO: eth to token
	})


	test("repeated back and forth trade should decrease slippage per trade", async () => {

	})

	test("repeated back and forth trade should increase scarcity price of both tokens", async () => {

	})
})