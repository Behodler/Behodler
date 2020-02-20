
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const pyroTokenABI = require('./PyroToken.json').abi
const patienceRegulationEngineABI = require('./PatienceRegulationEngine.json').abi

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

contract('PyroToken', accounts => {
    var mock1Instance, bellowsInstance, registryInstance, lachesisInstance, kharonInstance, mockBehodlerInstance
    setup(async () => {
        mock1Instance = await mockToken1.deployed()
        mock2Instance = await mockToken2.deployed()
        mockInvalidTokenInstance = await mockInvalidToken.deployed()
        bellowsInstance = await bellows.deployed()
        registryInstance = await registry.deployed()
        lachesisInstance = await lachesis.deployed()
        kharonInstance = await kharon.deployed()
        mockBehodlerInstance = await mockBehodler.deployed()

        const bellowsAddress = (await kharonInstance.bellows()).toString()
        const prometheusAddress = await kharonInstance.prometheus()
        
        const preAddress = (await kharonInstance.PatienceRegulationEngine()).toString()
        const bankAddress = (await kharonInstance.WeiDaiBank()).toString()
        const daiAddress = (await kharonInstance.Dai()).toString()
        const scarcityAddress = (await kharonInstance.scarcityAddress()).toString()
        const cutoff = 1000
        const donationAddress =accounts[3]
        await kharonInstance.seed(bellowsAddress,mockBehodlerInstance.address,prometheusAddress,preAddress,bankAddress,daiAddress,scarcityAddress,cutoff,donationAddress)
        // seed (address bl, address bh, address pm, address pr, address ban,address dai, address scar, uint cut, address d)
        primary = accounts[0]
    })

    test("demandToll on scarcity returns 0 and does nothing", async () => {
      
    })
})