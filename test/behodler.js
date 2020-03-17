
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle

const test = async.test
const setup = async.setup
const scarcity = artifacts.require("Scarcity")
const behodler = artifacts.require('Behodler')
const mockToken1 = artifacts.require('MockToken1')
const mockToken2 = artifacts.require('MockToken2')

let primary = ""
contract('behodler', accounts => {
	var scarcityInstance, behodlerInstance, mock1Instance, mock2Instance
	const primaryOptions = { from: accounts[0], gas: "0x6091b7" }

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

	test("buy should increase scarcity price of token, sell should decrease", async () => {
		//buy should produce pyrotoken balance for user
		//buy should increase price of scarcity
		let amountToBuy = "100"
		const averageMock1Price = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		assert.equal(averageMock1Price.toString(), "1863402546476111744")

		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		let difference = averageMock1Price.sub(averageMock1PriceAfter)
		assert.equal(difference.toString(), "1098287110592505885")

		const scarcityBalance1 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance1.toString(),"182613449554658950972") //

		await scarcityInstance.transfer(accounts[1],scarcityBalance1.toString(),primaryOptions)

		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter2 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter.sub(averageMock1PriceAfter2)
		assert.equal(difference.toString(), "177122184474172826")

		const scarcityBalance2 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance2.toString(),"74981312716593374224") //10^30

		await scarcityInstance.transfer(accounts[1],scarcityBalance2.toString(),primaryOptions)

		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter3 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter2.sub(averageMock1PriceAfter3)
		assert.equal(difference.toString(), "91987515474891322")

		const scarcityBalance3 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance3.toString(),"57623338638124437281") //10^

		await scarcityInstance.transfer(accounts[1],scarcityBalance3.toString(),primaryOptions)

		amountToBuy = "10000000000000000000"

		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter4 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter3.sub(averageMock1PriceAfter4)
		assert.equal(difference.toString(), "496005733488751918")


		const scarcityBalance4 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance4.toString(),"57629470454071109199781070764") //10^

		await scarcityInstance.transfer(accounts[1],scarcityBalance4.toString(),primaryOptions)


		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter5 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter4.sub(averageMock1PriceAfter5)
		assert.equal(difference.toString(), "569069278")

		const scarcityBalance5 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance5.toString(),"23870908385023433526981372677") //10^
		

		await scarcityInstance.transfer(accounts[1],scarcityBalance5.toString(),primaryOptions)

		amountToBuy = "10000000000000000000000"//10^22 = 10 000 eth
		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter6 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter5.sub(averageMock1PriceAfter6)
		assert.equal(difference.toString(), "1799432480")
		assert.equal(averageMock1PriceAfter6.toString(),"77288035")

		const scarcityBalance6 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance6.toString(),"1742724994244121402579962064077") //10^30

		await scarcityInstance.transfer(accounts[1],scarcityBalance6.toString(),primaryOptions)

		amountToBuy = "1000000000000000000000000"//10^24 = 1000 000 eth
		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter7 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter6.sub(averageMock1PriceAfter7)
		assert.equal(difference.toString(), "69581018")
		assert.equal(averageMock1PriceAfter6.toString(),"77288035")

		const scarcityBalance7 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance7.toString(),"16490888285211129615662578171560") //10^31
		await scarcityInstance.transfer(accounts[1],scarcityBalance7.toString(),primaryOptions)

		amountToBuy = "1000000000000000000000000"//10^26 = 100 000 000 eth ~ total supply
		await mock1Instance.approve(behodlerInstance.address, amountToBuy, primaryOptions)
		await behodlerInstance.buyScarcity(mock1Instance.address, amountToBuy, 0, primaryOptions);
		const averageMock1PriceAfter8 = (await behodlerInstance.calculateAverageScarcityPerToken(mock1Instance.address, amountToBuy, primaryOptions))
		difference = averageMock1PriceAfter7.sub(averageMock1PriceAfter8)
		assert.equal(difference.toString(), "1784407")
		assert.equal(averageMock1PriceAfter7.toString(),"7707017")

		const scarcityBalance8 = await scarcityInstance.balanceOf(primary)
		assert.equal(scarcityBalance8.toString(),"7522049081184884147578667814445") //10^30

		await scarcityInstance.transfer(accounts[1],scarcityBalance8.toString(),primaryOptions)

		//SELL
		//TODO:SELL

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

	test("sell should burn scarcity", async () => {

	})

	test("setting slippage to zero should ignore all slippage", async () => {

	})
})