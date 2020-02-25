
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const time = require('./helpers/time')
const pyroTokenABI = require('./ABI/PyroToken.json').abi
const mockDaiABI = require('./ABI/MockDai.json').abi
const weidaiBankABI = require('./ABI/WeiDaiBank.json').abi
const weidaiABI = require('./ABI/WeiDai.json').abi
const preABI = require('./ABI/PatienceRegulationEngine').abi

const test = async.test
const setup = async.setup
const mockToken1 = artifacts.require('MockToken1')
const mockToken2 = artifacts.require('MockToken2')
const mockInvalidToken = artifacts.require('MockInvalidToken')
const bellows = artifacts.require('Bellows')
const lachesis = artifacts.require("Lachesis")
const registry = artifacts.require("PyroTokenRegistry")
const kharon = artifacts.require('Kharon')
const mockBehodler = artifacts.require('MockBehodler')
const scarcity = artifacts.require('Scarcity')


contract('kharon', accounts => {
    let mock1Instance, bellowsInstance, registryInstance, lachesisInstance, kharonInstance, mockBehodlerInstance
    let scarcityAddress, scarcityInstance, mockDaiInstance, primary, donationAccount, daiAddress, weidaiBankAddress, weiDaiAddress
    let weidaiBankInstance, weidaiInstance, preAddress
    setup(async () => {
        mock1Instance = await mockToken1.deployed()
        mock2Instance = await mockToken2.deployed()
        mockInvalidTokenInstance = await mockInvalidToken.deployed()
        bellowsInstance = await bellows.deployed()
        registryInstance = await registry.deployed()
        lachesisInstance = await lachesis.deployed()
        kharonInstance = await kharon.deployed()
        mockBehodlerInstance = await mockBehodler.deployed()
        scarcityInstance = await scarcity.deployed()
        const bellowsAddress = (await kharonInstance.bellows()).toString()
        const prometheusAddress = await kharonInstance.prometheus()

        preAddress = (await kharonInstance.PatienceRegulationEngine()).toString()
        const bankAddress = (await kharonInstance.WeiDaiBank()).toString()
        daiAddress = (await kharonInstance.Dai()).toString()
        scarcityAddress = (await kharonInstance.scarcityAddress()).toString()
        const cutoff = 1000
        const donationAddress = accounts[3]
        weiDaiAddress = "0x8a16E29CaC5e50c9aa2a497589a02004e83e10e2"
        weidaiBankAddress = "0x156E7b05073A8AD3C867b1362bb917696dCCA3f2"
        await kharonInstance.seed(bellowsAddress, mockBehodlerInstance.address, prometheusAddress, preAddress, bankAddress, daiAddress, weiDaiAddress, scarcityAddress, cutoff, donationAddress)

        mockDaiInstance = (await new web3.eth.Contract(mockDaiABI, "0xB9f5A0Ad0B8F3b3C704C9b071f753F73Cc8843bE")).methods
        weidaiBankInstance = (await new web3.eth.Contract(weidaiBankABI, weidaiBankAddress)).methods
        weidaiInstance = (await new web3.eth.Contract(weidaiABI, weiDaiAddress)).methods
        primary = accounts[0]
        donationAccount = accounts[5]


    })

    test("demandToll on scarcity returns 0 and does nothing", async () => {
        const scarcityBalanceBefore = (await scarcityInstance.balanceOf(primary)).toNumber()
        await scarcityInstance.approve(mockBehodlerInstance.address, "100000", { from: primary })
        await mockBehodlerInstance.demandPaymentInvoker(scarcityAddress, 10, primary)
        const latestResult = await mockBehodlerInstance.latestDemandPaymentResult();
        assert.equal(latestResult, "0")

        const scarcityBalanceAfter = (await scarcityInstance.balanceOf(primary)).toString()
        assert.equal(scarcityBalanceBefore, scarcityBalanceAfter)
    })

    test('demandPayment on dai, get no reward, behodler balanced reduced by 2.4%, withdraw balance of weidai worth 2.4%', async () => {
        const spendingAccount = accounts[2]
        await mockDaiInstance.transfer(spendingAccount, "10000").send({ from: primary });
        await mockDaiInstance.approve(mockBehodlerInstance.address, "100000").send({ from: spendingAccount });

        const redeemRateBefore = (await weidaiBankInstance.daiPerMyriadWeidai().call({ from: primary })).toString()

        assert.equal(redeemRateBefore, "100")
        const weiDaiBalanceOfBankBefore = (await weidaiInstance.balanceOf(weidaiBankAddress).call({ from: primary })).toString()
        assert.equal(weiDaiBalanceOfBankBefore, 0)
        await mockBehodlerInstance.demandPaymentInvoker(daiAddress, "10000", spendingAccount, { from: spendingAccount })

        const behodlerBalance = (await mockDaiInstance.balanceOf(mockBehodlerInstance.address).call({ from: spendingAccount })).toString()
        assert.equal(behodlerBalance, "9760")

        const redeemRateAfter = (await weidaiBankInstance.daiPerMyriadWeidai().call({ from: primary })).toString()
        assert.equal(redeemRateAfter, "1000");

        const weiDaiBalanceOfBankAfter = (await weidaiInstance.balanceOf(weidaiBankAddress).call({ from: primary })).toString()
        assert.equal(weiDaiBalanceOfBankAfter, "2400")

    })

    test('demandPayment on weidai, get no reward, burn weidai, bank balance increases', async () => {
        //TODO: weidai purchasing failing
        const preInstance = (await new web3.eth.Contract(preABI, preAddress)).methods
        await mockDaiInstance.approve(weidaiBankAddress, "1000").send({ from: primary })
        await preInstance.claimWeiDai().send({ from: primary })
        await preInstance.buyWeiDai("1000", "20").send({ from: primary })
        // const initialBlock = (await web3.eth.getBlockNumber());
        // for (let blockNumber = (await web3.eth.getBlockNumber()); blockNumber <= initialBlock + 50; blockNumber = (await time.advanceBlock()));

        // await preInstance.claimWeiDai().send({ from: primary })
        // const initialWeiDaiBalance = (await weidaiInstance.balanceOf(primary).call({ from: primary })).toString()
        // assert.equal(initialWeiDaiBalance, "100000")
    })
})