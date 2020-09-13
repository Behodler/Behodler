
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const bigNumber = require('bignumber.js')
const test = async.test
const setup = async.setup
const feeSplitter = artifacts.require("FeeSplitter")
const MockToken1 = artifacts.require('MockToken1')

contract('FeeSplitter', accounts => {
    const primaryOptions = { from: accounts[0], gas: "0x6091b7" }
    var feeSplitterInstance, founder, dgvc, mockToken1Instance
    setup(async () => {
        feeSplitterInstance = await feeSplitter.deployed()
        mockToken1Instance = await MockToken1.deployed()
        founder = accounts[0]
        dgvc = accounts[3]

    })


    test("propose new split by non beneficiary fails", async () => {
        await expectThrow(feeSplitterInstance.proposeNewSplit(12, { from: accounts[2] }), 'must be listed beneficiary')
    })

    test("propose new split with value larger than 100 fails", async () => {
        await expectThrow(feeSplitterInstance.proposeNewSplit(101), '% expressed as value between 0 and 100')
    })

    test("propose new disagreement split does not change split", async () => {
        const splitBefore = (await feeSplitterInstance.split.call()).toNumber()
        await feeSplitterInstance.proposeNewSplit(splitBefore + 10, { from: dgvc })
        await feeSplitterInstance.proposeNewSplit(splitBefore - 10, { from: founder })
        const split = (await feeSplitterInstance.split.call()).toNumber()
        assert.equal(split, splitBefore)
    })


    test("propose new agreement split updates split, repeat succeeds", async () => {
        const splitBefore = (await feeSplitterInstance.split.call()).toNumber()
        assert.notEqual(splitBefore, 40)
        await feeSplitterInstance.proposeNewSplit(40, { from: dgvc })
        await feeSplitterInstance.proposeNewSplit(40, { from: founder })
        const splitAfter = (await feeSplitterInstance.split.call()).toNumber()
        assert.equal(splitAfter, 40)

        await feeSplitterInstance.proposeNewSplit(50, { from: dgvc })
        await feeSplitterInstance.proposeNewSplit(50, { from: founder })

        const finalSplit = (await feeSplitterInstance.split.call()).toNumber()
        assert.equal(finalSplit, 50)
    })

    test("both founder and dgvc can update dgvc address", async () => {
        await feeSplitterInstance.updateDGVC(accounts[7])
        const dgvcAfterFounder = await feeSplitterInstance.dgvc.call()
        assert.equal(dgvcAfterFounder, accounts[7])

        await feeSplitterInstance.updateDGVC(dgvc, { from: accounts[7] })
        const dgvcAfterDGVC = await feeSplitterInstance.dgvc.call()
        assert.equal(dgvcAfterDGVC, dgvc)

        await expectThrow(feeSplitterInstance.updateDGVC(accounts[2], { from: accounts[2] }), 'must be listed beneficiary')
    })

    test("only founder can update founder address", async () => {
        await feeSplitterInstance.updateFounder(accounts[8])
        const founder8 = await feeSplitterInstance.founder.call()
        assert.equal(founder8, accounts[8])

        await expectThrow(feeSplitterInstance.updateFounder(founder), 'must be founder')
        await feeSplitterInstance.updateFounder(founder, { from: accounts[8] })
        const founderFinal = await feeSplitterInstance.founder.call()
        assert.equal(founderFinal, founder)
    })

    test("withdraw splits balance according to split", async () => {
        const amountTosend = 10000
        await mockToken1Instance.transfer(feeSplitterInstance.address, amountTosend)
        const founderBalance = await mockToken1Instance.balanceOf.call(founder)
        await mockToken1Instance.transfer(accounts[5], founderBalance, { from: founder })

        await feeSplitterInstance.proposeNewSplit(40, { from: dgvc })
        await feeSplitterInstance.proposeNewSplit(40, { from: founder })

        const expectedFounderValue = 0.6 * amountTosend;
        const expectedDGVCVaue = 0.4 * amountTosend

        const founderBalanceBefore = await mockToken1Instance.balanceOf.call(founder)
        const dgvcBalanceBefore = await mockToken1Instance.balanceOf.call(dgvc)
        assert.isTrue((founderBalanceBefore == 0) && (founderBalanceBefore - dgvcBalanceBefore == 0), `founderBalance: ${founderBalanceBefore}, dgvcBalanceBefore: ${dgvcBalanceBefore}`)
        await feeSplitterInstance.withdraw(mockToken1Instance.address)

        const founderBalanceAfter = await mockToken1Instance.balanceOf.call(founder)
        const dgvcBalanceAfter = await mockToken1Instance.balanceOf.call(dgvc)

        assert.equal(founderBalanceAfter, expectedFounderValue)
        assert.equal(dgvcBalanceAfter, expectedDGVCVaue)
    })
})