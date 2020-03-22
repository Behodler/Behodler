
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const pyroTokenABI = require('./ABI/PyroToken.json').abi
const patienceRegulationEngineABI = require('./ABI/PatienceRegulationEngine.json').abi

const test = async.test
const setup = async.setup
const mockToken1 = artifacts.require('MockToken1')
const mockToken2 = artifacts.require('MockToken2')
const mockInvalidToken = artifacts.require('MockInvalidToken')
const bellows = artifacts.require('Bellows')
const lachesis = artifacts.require("Lachesis")
const registry = artifacts.require("PyroTokenRegistry")
const kharon = artifacts.require('Kharon')

contract('PyroToken', accounts => {
    var mock1Instance, bellowsInstance, registryInstance, lachesisInstance, kharonInstance
    setup(async () => {
        mock1Instance = await mockToken1.deployed()
        mock2Instance = await mockToken2.deployed()
        mockInvalidTokenInstance = await mockInvalidToken.deployed()
        bellowsInstance = await bellows.deployed()
        registryInstance = await registry.deployed()
        lachesisInstance = await lachesis.deployed()
        kharonInstance = await kharon.deployed()
        primary = accounts[0]
    })

    test("Add invalid token to registry", async () => {
        await lachesisInstance.measure(mock1Instance.address, false)
        await expectThrow(registryInstance.addToken('silly', "sym", mock1Instance.address), "invalid token.")
    })

    test("Add valid token creates a pyrotoken that exists in baseTokenMapping. Invoking symbol and name yields the correct results.", async () => {
        await lachesisInstance.measure(mock1Instance.address, true)
        await registryInstance.addToken("valid", "val", mock1Instance.address);
        const pyroTokenAddress = await registryInstance.baseTokenMapping(mock1Instance.address);
        const pyroTokenInstance = (await new web3.eth.Contract(pyroTokenABI, pyroTokenAddress))
        const pAddress = pyroTokenInstance.options.address
        const addressmapping = await registryInstance.pyroTokenMapping(pAddress)
        assert.equal(addressmapping, mock1Instance.address)
        const pname = await pyroTokenInstance.methods.name().call()
        const psymbol = await pyroTokenInstance.methods.symbol().call()
        const pdecimals = await pyroTokenInstance.methods.decimals().call()
        assert.equal(pname, "valid")
        assert.equal(psymbol, "val")
        assert.equal(pdecimals, 18)
    })

    test("burn increases redeem rate at bellows", async () => {
        const options = { from: accounts[0], gas: "0x691b7" }
        await lachesisInstance.measure(mock1Instance.address, true)
        await registryInstance.addToken("valid", "val", mock1Instance.address);
        const pyroTokenAddress = await registryInstance.baseTokenMapping(mock1Instance.address);
        const pyroTokenInstance = (await new web3.eth.Contract(pyroTokenABI, pyroTokenAddress))
        const preInstance = (await new web3.eth.Contract(patienceRegulationEngineABI, "0x4Cfde611c84E2318C01092Ade351479b71164203"))
        await preInstance.methods.setDonationSplit(20).send(options)
        const pAddress = pyroTokenInstance.options.address
        await mock1Instance.approve(pyroTokenAddress, "1000")
        await pyroTokenInstance.methods.engulf(accounts[0], "100").send(options)
        const redeemRate = (await bellowsInstance.getRedeemRate(pAddress)).toString()
        assert.equal(redeemRate, "100")
        await pyroTokenInstance.methods.burn(5000).send(options)
        const balance = await pyroTokenInstance.methods.balanceOf(accounts[0]).call(options)
        assert.equal(balance, "5000")
        const redeemRateAfter = (await bellowsInstance.getRedeemRate(pAddress)).toString()
        assert.equal(redeemRateAfter, "166")

        const kharonBalance = (await pyroTokenInstance.methods.balanceOf(kharonInstance.address).call()).toString()
        assert.equal(kharonBalance, "1000")
    })
})