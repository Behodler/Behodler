
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle

const test = async.test
const setup = async.setup
const scarcity = artifacts.require("Scarcity")
const mockToken1 = artifacts.require('MockToken1')
const mockInvalidToken = artifacts.require('MockInvalidToken')
const validator = artifacts.require('Validator')

let primary = ""
contract('Validator', accounts => {
    var mock1Instance, validatorInstance, mockInvalidTokenInstance
    setup(async () => {
        scarcityInstance = await scarcity.deployed()
        mock1Instance = await mockToken1.deployed()
        mockInvalidTokenInstance = await mockInvalidToken.deployed()
        validatorInstance = await validator.deployed()
        primary = accounts[0]
    })

    test("toggling token validity and scarcity", async () => {
        await validatorInstance.setValid(mock1Instance.address, false)
        const mock1InstanceInvalid = await validatorInstance.tokens.call(mock1Instance.address)
        assert.isFalse(mock1InstanceInvalid)

        await validatorInstance.setValid(mock1Instance.address, true)
        const mock1InstanceValid = await validatorInstance.tokens.call(mock1Instance.address)
        assert.isTrue(mock1InstanceValid)

        await validatorInstance.setScarcity(mockInvalidTokenInstance.address)
        const firstScarcity = await validatorInstance.scarcity.call()
        assert.equal(firstScarcity, mockInvalidTokenInstance.address)

        await validatorInstance.setScarcity(scarcity.address)
        const secondScarcity = await validatorInstance.scarcity.call()
        assert.equal(secondScarcity, scarcity.address)
    })
})