const CNetwork = require('./network')
const tDeployer = require("truffle-deployer")
const {CBoard} = require("w3glue")

const symMyBoxLst = Symbol("myBoxLst")

class CDeployer extends CNetwork {

    constructor(netName, connStr) {
        super(netName, connStr)

        /** @type {{string:CBox}} */
        this[symMyBoxLst] = {}
    }

    get boxLst() {
        return this[symMyBoxLst]
    }

    /**
     * create box from boxData and insert it to boxLst
     * @param {string} contractStr - ex. 'v1/Leblock'
     * @param {{contractName, abi, bytecode}} boxData - ex. '{"Leblock", [...], "0x..."}'
     */
    addBox(contractStr, boxData) {
        if (!!this.boxLst[contractStr]) {
            return false // already exist
        }
        let box = this.createBox(boxData)
        this.boxLst[contractStr] = box
        return box
    }

    getBox(contractStr) {
        return this.boxLst[contractStr]
    }

    /**
     * deploy with a contractStr
     * @param {string} contractStr
     * @param {string} sender
     * @param {...any} args
     * @return {Promise<CBoard>}
     */
    async deploy(contractStr, sender, ...args) {
        let box = this.getBox(contractStr);
        let truffleContract = box.truffleContract

        let truffleDeployer = new tDeployer({
            contracts: [truffleContract],
            network: "test",
            network_id: truffleContract.web3.version.network,
            provider: truffleContract.web3.currentProvider
        })

        let gas = truffleContract.web3.eth.estimateGas({data: truffleContract.bytecode})

        console.log("` deploy:", contractStr, "args:", args, "from:", sender)
        truffleDeployer.deploy(truffleContract, ...args, {
            from: sender,
            gas: gas * 1.2 | 0
        })
        let rsp = await truffleDeployer.start();
        let board = new CBoard(contractStr, rsp.address, rsp)
        console.log(board.json)
        return board
    }
}

module.exports = CDeployer
