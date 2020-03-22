
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle

const test = async.test
const setup = async.setup
const scarcity = artifacts.require("Scarcity")
const behodler = artifacts.require('Behodler')
const mockToken1 = artifacts.require('MockToken1')
const mockToken2 = artifacts.require('MockToken2')
const pyroTokenABI = require('./ABI/PyroToken.json').abi
const bellows = artifacts.require('Bellows')
const registry = artifacts.require("PyroTokenRegistry")

let primary = ""
contract('behodler', accounts => {
	var scarcityInstance, behodlerInstance, mock1Instance, mock2Instance, registryInstance, bellowsInstance
	const primaryOptions = { from: accounts[0], gas: "0x6091b7" }

	setup(async () => {
		scarcityInstance = await scarcity.deployed()
		behodlerInstance = await behodler.deployed()
		mock1Instance = await mockToken1.deployed()
		mock2Instance = await mockToken2.deployed()
		registryInstance = await registry.deployed()
		bellowsInstance = await bellows.deployed()
		primary = accounts[0]
	})

	test("calculateAverageScarcityPerToken with zero value should fail", async () => {
		await expectThrow(behodlerInstance.calculateAverageScarcityPerToken(mock2Instance.address, "0", { from: primary }), 'Non-zero token value expected to avoid division by zero.')
	})

	test("buy should increase scarcity price of token, sell should decrease", async () => {

		const pyroTokenAddress = await registryInstance.baseTokenMapping(mock1Instance.address)
		const pyroTokenInstance = (await new web3.eth.Contract(pyroTokenABI, pyroTokenAddress))
		const pyroTokenBalanceBeforeFirstBuy = parseInt((await pyroTokenInstance.methods.balanceOf(primary).call(primaryOptions)).toString())
		assert.equal(pyroTokenBalanceBeforeFirstBuy, 0)

		let amountToBuy = "100"
		const averageMock1Price = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		assert.equal(averageMock1Price.toString(), "1863402546476111744")

		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		let difference = averageMock1Price.sub(averageMock1PriceAfter)
		assert.equal(difference.toString(), "1098287110592505885")

		const scarcityBalance1 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance1.toString(), "182613449554658950972")

		const pyroTokenBalanceAfterFirstBuy = parseInt((await pyroTokenInstance.methods.balanceOf(primary).call(primaryOptions)).toString())
		assert.equal(pyroTokenBalanceAfterFirstBuy, 100)
		const redeemRateAfterFirstBuy = (await bellowsInstance.getRedeemRate(pyroTokenAddress, primaryOptions)).toNumber()
		assert.equal(redeemRateAfterFirstBuy, 100)

		await scarcityInstance.transfer(accounts[1], scarcityBalance1.toString(), primaryOptions)

		const pyroTokenBalanceBeforeSecondBuy = parseInt((await pyroTokenInstance.methods.balanceOf(primary).call(primaryOptions)).toString())
		assert.equal(pyroTokenBalanceBeforeSecondBuy, 100)

		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter2 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter.sub(averageMock1PriceAfter2)
		assert.equal(difference.toString(), "177122184474172826")

		const pyroTokenBalanceAfterSecondBuy = parseInt((await pyroTokenInstance.methods.balanceOf(primary).call(primaryOptions)).toString())
		assert.equal(pyroTokenBalanceAfterSecondBuy, 200)

		const scarcityBalance2 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance2.toString(), "74981312716593374224") //10^30

		await scarcityInstance.transfer(accounts[1], scarcityBalance2.toString(), primaryOptions)

		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter3 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter2.sub(averageMock1PriceAfter3)
		assert.equal(difference.toString(), "91987515474891322")

		const scarcityBalance3 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance3.toString(), "57623338638124437281") //10^

		await scarcityInstance.transfer(accounts[1], scarcityBalance3.toString(), primaryOptions)

		amountToBuy = "10000000000000000000"

		await pyroTokenInstance.methods.transfer(accounts[1], 300).send(primaryOptions)

		const pyroTokenBalanceBeforeFirstBigBuy = parseInt((await pyroTokenInstance.methods.balanceOf(primary).call(primaryOptions)).toString())
		assert.equal(pyroTokenBalanceBeforeFirstBigBuy, 0)


		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter4 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter3.sub(averageMock1PriceAfter4)
		assert.equal(difference.toString(), "496005733488751918")


		const pyroTokenBalanceAfterFirstBigBuy = parseInt((await pyroTokenInstance.methods.balanceOf(primary).call(primaryOptions)).toString())
		assert.equal(pyroTokenBalanceAfterFirstBigBuy, 12000000000000000000)

		const scarcityBalance4 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance4.toString(), "57629470454071109199781070764")

		await scarcityInstance.transfer(accounts[1], scarcityBalance4.toString(), primaryOptions)


		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter5 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter4.sub(averageMock1PriceAfter5)
		assert.equal(difference.toString(), "569069278")

		const scarcityBalance5 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance5.toString(), "23870908385023433526981372677") //10^


		await scarcityInstance.transfer(accounts[1], scarcityBalance5.toString(), primaryOptions)

		amountToBuy = "10000000000000000000000"//10^22 = 10 000 eth
		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter6 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter5.sub(averageMock1PriceAfter6)
		assert.equal(difference.toString(), "1799432480")
		assert.equal(averageMock1PriceAfter6.toString(), "77288035")

		const scarcityBalance6 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance6.toString(), "1742724994244121402579962064077") //10^30

		await scarcityInstance.transfer(accounts[1], scarcityBalance6.toString(), primaryOptions)

		amountToBuy = "1000000000000000000000000"//10^24 = 1000 000 eth
		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter7 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter6.sub(averageMock1PriceAfter7)
		assert.equal(difference.toString(), "69581018")
		assert.equal(averageMock1PriceAfter6.toString(), "77288035")

		const scarcityBalance7 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance7.toString(), "16490888285211129615662578171560") //10^31
		await scarcityInstance.transfer(accounts[1], scarcityBalance7.toString(), primaryOptions)

		amountToBuy = "1000000000000000000000000"//10^26 = 100 000 000 eth ~ total supply
		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter8 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter7.sub(averageMock1PriceAfter8)
		assert.equal(difference.toString(), "1784407")
		assert.equal(averageMock1PriceAfter7.toString(), "7707017")

		const scarcityBalance8 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance8.toString(), "7522049081184884147578667814445") //10^30

		await scarcityInstance.transfer(accounts[1], scarcityBalance8.toString(), primaryOptions)
		const balanceOfAccount1 = (await scarcityInstance.balanceOf(accounts[1])).toString()
		await scarcityInstance.transfer(accounts[0], balanceOfAccount1, { from: accounts[1] })

		const totalPrimaryBalance = await scarcityInstance.balanceOf(primary)
		const totalPrimaryBalanceEth = web3.utils.fromWei(totalPrimaryBalance.toString())
		assert.equal(totalPrimaryBalanceEth.toString(), "25837162739794.447809457347256")

		//SELL
		//TODO:SELL
		const ethToSell = "10000000000000"
		const balanceOfMock1BeforeFirstSell = await mock1Instance.balanceOf(primary)
		const totalScarcitySupplyBeforeFirstSell = await scarcityInstance.totalSupply()

		assert.equal(parseInt(web3.utils.fromWei(balanceOfMock1BeforeFirstSell.toString())), 997989979)
		assert.equal(parseInt(web3.utils.fromWei(totalScarcitySupplyBeforeFirstSell.toString())), 25837162739794)

		await scarcityInstance.approve(behodlerInstance.address, "25837162739794447809457347256")
		await behodlerInstance.sellScarcity(mock1Instance.address, web3.utils.toWei(ethToSell), 0, primaryOptions)

		const balanceOfMock1AfterFirstSell = await mock1Instance.balanceOf(primary)
		const totalScarcitySupplyAfterFirstSell = await scarcityInstance.totalSupply()

		assert.equal(parseInt(web3.utils.fromWei(balanceOfMock1AfterFirstSell.toString())), 999192169)
		const differenceAfterFirstSell = parseInt(web3.utils.fromWei(balanceOfMock1AfterFirstSell.toString())) - parseInt((web3.utils.fromWei(balanceOfMock1BeforeFirstSell.toString())))
		assert.equal(differenceAfterFirstSell, 1202190)
		assert.equal(parseInt(web3.utils.fromWei(totalScarcitySupplyAfterFirstSell.toString())), 15837162739794)
		const differenceInScarcityAfterFirstSell = web3.utils.toWei((web3.utils.fromWei(totalScarcitySupplyBeforeFirstSell.toString()) - web3.utils.fromWei(totalScarcitySupplyAfterFirstSell.toString())).toString())
		assert.equal(differenceInScarcityAfterFirstSell, "10000000000000002000000000000000")

		const ethToSell2 = "1"
		const balanceOfMock1BeforeSecondSell = await mock1Instance.balanceOf(primary)
		const totalScarcitySupplyBeforeSecondSell = await scarcityInstance.totalSupply()

		assert.equal(balanceOfMock1BeforeSecondSell.toString(), "999192169288802715286217345")
		assert.equal(parseInt(web3.utils.fromWei(totalScarcitySupplyBeforeSecondSell.toString())), 15837162739794)

		await scarcityInstance.approve(behodlerInstance.address, "25837162739794447809457347256")
		assert.equal(web3.utils.toWei(ethToSell2), "1000000000000000000")
		await behodlerInstance.sellScarcity(mock1Instance.address, web3.utils.toWei(ethToSell2), 0, primaryOptions)

		const balanceOfMock1AfterSecondSell = await mock1Instance.balanceOf(primary)
		const totalScarcitySupplyAfterSecondSell = await scarcityInstance.totalSupply()

		assert.equal(balanceOfMock1AfterSecondSell.toString(), "999192169288802807511453557")
		const differenceAfterSecondSell = parseInt((balanceOfMock1AfterSecondSell.sub(balanceOfMock1BeforeSecondSell)).toString())
		assert.equal(differenceAfterSecondSell, 92225236212)
		assert.equal(totalScarcitySupplyAfterSecondSell.toString(), "15837162739793447809457347256000")
		const differenceInScarcityAfterSecondSell = (totalScarcitySupplyBeforeSecondSell.sub(totalScarcitySupplyAfterSecondSell)).toString()
		assert.equal(differenceInScarcityAfterSecondSell, web3.utils.toWei(ethToSell2))
	})

	test("buy with too much slippage should fail", async () => {

		let amountToBuy = web3.utils.toWei("10000")

		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await expectThrow(behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, web3.utils.toWei("2000"), primaryOptions), "price slippage (min) exceeded tolerance.");

	})

	test("sell with too much slippage should fail", async () => {
		
		let amountToSell =  web3.utils.toWei("10")
		await scarcityInstance.approve(behodlerInstance.address, "25837162739794447809457347256")
		await expectThrow(behodlerInstance.sellScarcity(mock1Instance.address, amountToSell, 1, primaryOptions),"price slippage (max) exceeded tolerance.")

	})

})