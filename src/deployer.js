const Web3 = require('web3')
const tDeployer = require("truffle-deployer")

const CBox = require("./box")
const CBoard = require("./board")

let symMyProvider = Symbol("myProvider")
let symMyBoxLst = Symbol("myBoxLst")

class CDeployer {

    constructor(networkName, connStr) {
        this.networkName = networkName
        this.connStr = connStr
        this[symMyProvider] = new Web3.providers.HttpProvider(connStr)

        /** @type {{string:CBox}} */
        this[symMyBoxLst] = {}

        /** @type {{string:CBoard}} */
        this.boardLst = {}
    }

    get provider(){
        return this[symMyProvider]
    }

    get boxLst() {
        return this[symMyBoxLst]
    }

    /**
     * create box from boxData and insert it to boxLst
     * @param {string} contractStr - ex. 'v1/Leblock'
     * @param {{contractName, abi, bytecode}} boxData - ex. '{"Leblock", [...], "0x..."}'
     */
    createBox(contractStr, boxData) {
        if(!!this.boxLst[contractStr]) {
            return false // already exist
        }
        let box = CBox.fromJson(boxData).setProvider(this.provider)
        this.boxLst[contractStr] = box
    }


    getBox(contractStr){
        return this.boxLst[contractStr]
    }

    regBoard(tag, board) {
        if(!!this.boardLst[tag]){
            return false
        }
        this.boardLst[tag] = board
        return true
    }

    uregBoard(tag) {
        this.boardLst[tag] = undefined
    }

    getBoard(tag) {
        return this.boardLst[tag]
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
        return new CBoard(contractStr, rsp.address, this)
    }
}

module.exports = CDeployer