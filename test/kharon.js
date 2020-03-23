
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const time = require('./helpers/time')
const pyroTokenABI = require('./ABI/PyroToken.json').abi
const mockDaiABI = require('./ABI/MockDai.json').abi
const weidaiBankABI = require('./ABI/WeiDaiBank.json').abi
const weidaiABI = require('./ABI/WeiDai.json').abi
const preABI = require('./ABI/PatienceRegulationEngine.json').abi

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



let mock1Instance, bellowsInstance, registryInstance, lachesisInstance, kharonInstance, mockBehodlerInstance
let scarcityAddress, scarcityInstance, mockDaiInstance, primary, donationAccount, daiAddress, weidaiBankAddress, weiDaiAddress
let weidaiBankInstance, weidaiInstance, preAddress

let testSetup = async (accounts, cutoff) => {
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
    donationAccount = accounts[3]
    preAddress = (await kharonInstance.PatienceRegulationEngine()).toString()
    const bankAddress = (await kharonInstance.WeiDaiBank()).toString()
    daiAddress = (await kharonInstance.Dai()).toString()
    scarcityAddress = (await kharonInstance.scarcityAddress()).toString()
    weiDaiAddress = "0x8a16E29CaC5e50c9aa2a497589a02004e83e10e2"
    weidaiBankAddress = "0x156E7b05073A8AD3C867b1362bb917696dCCA3f2"
    await kharonInstance.seed(bellowsAddress, mockBehodlerInstance.address, prometheusAddress, preAddress, bankAddress, daiAddress, weiDaiAddress, scarcityAddress, cutoff, donationAccount)

    mockDaiInstance = (await new web3.eth.Contract(mockDaiABI, "0xB9f5A0Ad0B8F3b3C704C9b071f753F73Cc8843bE")).methods
    weidaiBankInstance = (await new web3.eth.Contract(weidaiBankABI, weidaiBankAddress)).methods
    weidaiInstance = (await new web3.eth.Contract(weidaiABI, weiDaiAddress)).methods
    primary = accounts[0]

    await scarcityInstance.setBehodler(mockBehodlerInstance.address, { from: primary, gas: "0x6091b7" })
    await mockBehodlerInstance.mintScarcity({ from: primary, gas: "0x6091b7" })
}

contract('kharon 1', accounts => {

    const primaryOptions = { from: accounts[0], gas: "0x6091b7" }

    setup(async () => {
        await testSetup(accounts, 1000)
    })

    test('demandPayment on weidai, get no reward, burn weidai, bank balance increases', async () => {
        const preInstance = (await new web3.eth.Contract(preABI, preAddress)).methods
        await mockDaiInstance.approve(weidaiBankAddress, "1000").send({ from: primary })
        await preInstance.claimWeiDai().send({ from: primary })
        await preInstance.buyWeiDai("1000", "20").send(primaryOptions)
        const initialBlock = (await web3.eth.getBlockNumber());
        for (let blockNumber = (await web3.eth.getBlockNumber()); blockNumber <= initialBlock + 50; blockNumber = (await time.advanceBlock()));
        await preInstance.claimWeiDai().send(primaryOptions)
        const initialWeiDaiBalance = (await weidaiInstance.balanceOf(primary).call({ from: primary })).toString()
        assert.equal(initialWeiDaiBalance, "100000")

        const weidaiBalanceOfBankBefore = (await weidaiInstance.balanceOf(weidaiBankAddress).call(primaryOptions)).toString()
        assert.equal(weidaiBalanceOfBankBefore, "0")

        await weidaiInstance.approve(mockBehodlerInstance.address, "100000").send(primaryOptions);
        await mockBehodlerInstance.demandPaymentInvoker(weiDaiAddress, "100000", accounts[0], primaryOptions)
        const weidaiBalanceOfPrimaryAfter = (await weidaiInstance.balanceOf(primary).call(primaryOptions)).toString()
        assert.equal(weidaiBalanceOfPrimaryAfter, "0")

        const weidaiBalanceOfBankAfter = (await weidaiInstance.balanceOf(weidaiBankAddress).call(primaryOptions)).toString()
        assert.equal(weidaiBalanceOfBankAfter, "480")
    })

})

contract('kharon 2', accounts => {

    const primaryOptions = { from: accounts[0], gas: "0x6091b7" }

    setup(async () => {
        await testSetup(accounts, 1000)
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

        const redeemRateAfter = parseInt((await weidaiBankInstance.daiPerMyriadWeidai().call({ from: primary })).toString())
        assert.isAtLeast(redeemRateAfter, 900);
        assert.isAtMost(redeemRateAfter, 995);

        const weiDaiBalanceOfBankAfter = (await weidaiInstance.balanceOf(weidaiBankAddress).call({ from: primary })).toString()
        assert.equal(weiDaiBalanceOfBankAfter, "2400")

    })
})

contract('kharon 3', accounts => {

    const primaryOptions = { from: accounts[0], gas: "0x6091b7" }

    setup(async () => {
        await testSetup(accounts, 999)
        await mockBehodlerInstance.mintScarcityCustom(100000, { from: primary, gas: "0x6091b7" })
    })

    test('setting scarcityBurnCutoff to be less than token scarcityObligations returns 0 and does nothing', async () => {
        await scarcityInstance.approve(mockBehodlerInstance.address, "100000", primaryOptions)
        await mockBehodlerInstance.demandPaymentInvoker(scarcityAddress, "100000", accounts[0], primaryOptions)

        const latestDemandPaymentResult = (await mockBehodlerInstance.latestDemandPaymentResult(primaryOptions)).toString()
        assert.equal(latestDemandPaymentResult, "0")

    })
})

contract('kharon 4', accounts => {

    const primaryOptions = { from: accounts[0], gas: "0x6091b7" }

    setup(async () => {
        await testSetup(accounts, 100000)
    })

    test('demand payment on scarcity', async () => {
        const scarcityTotal = (await scarcityInstance.totalSupply(primaryOptions)).toNumber()
        assert.equal(scarcityTotal, 10000)
        const primaryBalance = (await scarcityInstance.balanceOf(accounts[0], primaryOptions)).toNumber()
        assert.equal(primaryBalance, 10000)
        await scarcityInstance.approve(mockBehodlerInstance.address, 10000, primaryOptions)
        await mockBehodlerInstance.demandPaymentInvoker(scarcityInstance.address, 10000, accounts[0])
        const scarcityTotalAfter = (await scarcityInstance.totalSupply(primaryOptions)).toNumber()
        assert.equal(scarcityTotalAfter, 9760)
    })
})


contract('kharon 6', accounts => {

    const primaryOptions = { from: accounts[0], gas: "0x6091b7" }

    setup(async () => {
        await testSetup(accounts, 100000)
    })

    test('demand payment on registered token increases bellow by 1.2% and gifts buyer with 1.2% worth of pyrotoken', async () => {
        const pyroTokenAddress = await registryInstance.baseTokenMapping(mock1Instance.address)
        const pyroTokenInstance = (await new web3.eth.Contract(pyroTokenABI, pyroTokenAddress))
        const pyroTokenBalanceBefore = parseInt((await pyroTokenInstance.methods.balanceOf(primary).call(primaryOptions)).toString())
        assert.equal(pyroTokenBalanceBefore, 0)

        const currentRedeemRate = (await bellowsInstance.getRedeemRate(pyroTokenAddress, primaryOptions)).toNumber()
        assert.equal(currentRedeemRate, 100)

        const primaryBalance = (await mock1Instance.balanceOf(primary)).toString()
        assert.equal(primaryBalance, "1000000000000000000000000000");
        await mock1Instance.approve(mockBehodlerInstance.address, 10000)
        await mockBehodlerInstance.demandPaymentInvoker(mock1Instance.address, 10000, primary, primaryOptions)
        const demandResult = (await mockBehodlerInstance.latestDemandPaymentResult()).toNumber()
        assert.equal(demandResult, 240)
        const redeemRateAfter = (await bellowsInstance.getRedeemRate(pyroTokenAddress, primaryOptions)).toNumber()
        assert.equal(redeemRateAfter, 190)

        const pyroTokenBalanceAfter = parseInt((await pyroTokenInstance.methods.balanceOf(primary).call(primaryOptions)).toString())
        assert.equal(pyroTokenBalanceAfter, 12000)

        const kharonBalanceBefore = (await mock1Instance.balanceOf(kharonInstance.address)).toNumber()
        assert.equal(kharonBalanceBefore, 12)
        const mock1BalanceBefore = (await mock1Instance.balanceOf(donationAccount)).toNumber()
        const expectedDonationAddress = await kharonInstance.donationAddress()
        assert.equal(donationAccount, expectedDonationAddress)
        await kharonInstance.withdrawDonations(mock1Instance.address, primaryOptions)
        const mock1BalanceAfter = (await mock1Instance.balanceOf(donationAccount)).toNumber()
        assert.equal(mock1BalanceAfter - mock1BalanceBefore, 12)

        const kharonBalanceAfter = (await mock1Instance.balanceOf(kharonInstance.address)).toNumber()
        assert.equal(kharonBalanceAfter, 0)
    })
})


contract('kharon 5', accounts => {

    const primaryOptions = { from: accounts[0], gas: "0x6091b7" }

    setup(async () => {
        await testSetup(accounts, 100000)
    })

    test('demand payment on invalid token reverts', async () => {
        await mockInvalidTokenInstance.approve(mockBehodlerInstance.address, 10000, primaryOptions)
        await expectThrow(mockBehodlerInstance.demandPaymentInvoker(mockInvalidTokenInstance.address, 10000, primary, primaryOptions), "token not registered for trade")
    })
})