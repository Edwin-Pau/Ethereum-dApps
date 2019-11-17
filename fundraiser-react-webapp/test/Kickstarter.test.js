const assert = require('assert')
const ganache = require('ganache-cli')

// Constructor function, uppercase Web3. Portal into the Ethereum world.
const Web3 = require('web3')

// Attempt to connect to local test network.
const provider = ganache.provider()
const web3 = new Web3(provider)

// Import the entire source code for both contracts
const compiledInstance = require('../ethereum/build/KickstarterInstance.json');
const compiledKickstarter = require('../ethereum/build/Kickstarter.json')

let accounts;
let instance;
let kickstarterAddress;
let kickstarter;

// Sets up a local blockchain for testing
beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    instance = await new web3.eth.Contract(JSON.parse(compiledInstance.interface))
        .deploy({ data: compiledInstance.bytecode })
        .send({ from: accounts[0], gas: '1000000' });

    await instance.methods.createNewInstance('100').send({
        from: accounts[0],
        gas: '1000000'
    })
    
    // Returns an array of deployed addresses
    const addresses = await instance.methods.getDeployedInstances().call();
    kickstarterAddress = addresses[0];

    kickstarter = await new web3.eth.Contract(
        JSON.parse(compiledKickstarter.interface),
        kickstarterAddress
    )
})

// Local testing of the smart contracts instance and kickstarter
describe('Kickstarters', () => {
    // Ensure that deployment works for both contracts
    it('deploys a KickstarterInstance and a Kickstarter.', () => {
        assert.ok(instance.options.address);
        assert.ok(kickstarter.options.address);
    })

    // Ensure that the person creating a new instance of kickstarter is the manager of that contract
    it('recognizes caller of instance creation as the Kickstarter manager.', async () => {
        const manager = await kickstarter.methods.manager().call();
        assert.equal(accounts[0], manager);
    })

    // Ensure that users can contribute ether and also adds them to the contributors mapping
    it('allows users to contribute ether and adds them as a contributor to the mapping.', async () => {
        // Test transaction by sending 200 wei to contribute method
        await kickstarter.methods.contribute().send({
            value: '200',
            from: accounts[1]
        })

        // Checks if the accounts[1] is a contributor in the contract mapping
        const isContributor = await kickstarter.methods.contributors(accounts[1]);
        assert(isContributor);
    })

    // Ensure that a minimum contribution is required
    it('requires users to send a minimum contribution amount.', async () => {
        try {
            await kickstarter.methods.contribute().send({
                value: '10',
                from: accounts[1]
            })
            // Automatically fail
            assert(false);
        } catch (err) {
            assert(err);
        }
    })
})

