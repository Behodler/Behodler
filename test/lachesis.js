
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle

const test = async.test
const setup = async.setup
const scarcity = artifacts.require("Scarcity")
const mockToken1 = artifacts.require('MockToken1')
const mockInvalidToken = artifacts.require('MockInvalidToken')
const lachesis = artifacts.require('Lachesis')

let primary = ""
contract('Lachesis', accounts => {
    var mock1Instance, lachesisInstance, mockInvalidTokenInstance
    setup(async () => {
        scarcityInstance = await scarcity.deployed()
        mock1Instance = await mockToken1.deployed()
        mockInvalidTokenInstance = await mockInvalidToken.deployed()
        lachesisInstance = await lachesis.deployed()
        primary = accounts[0]
    })

    test("toggling token validity and scarcity", async () => {
        await lachesisInstance.measure(mock1Instance.address, false)
        const mock1InstanceInvalid = await lachesisInstance.tokens.call(mock1Instance.address)
        assert.isFalse(mock1InstanceInvalid)

        await lachesisInstance.measure(mock1Instance.address, true)
        const mock1InstanceValid = await lachesisInstance.tokens.call(mock1Instance.address)
        assert.isTrue(mock1InstanceValid)

        await lachesisInstance.setScarcity(mockInvalidTokenInstance.address)
        const firstScarcity = await lachesisInstance.scarcity.call()
        assert.equal(firstScarcity, mockInvalidTokenInstance.address)

        await lachesisInstance.setScarcity(scarcity.address)
        const secondScarcity = await lachesisInstance.scarcity.call()
        assert.equal(secondScarcity, scarcity.address)
    })
})