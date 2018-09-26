let fs = require("fs");
const Web3 = require('web3');
let contract = require("truffle-contract");
let Deployer = require("truffle-deployer");


class ContractBox {

    /**
     * create a contract box
     * @param {{contractName, abi, bytecode}} boxData
     * @return {ContractBox}
     */
    static fromJson(boxData) {
        let {contractName, abi, bytecode} = boxData
        return new ContractBox(contractName, abi, bytecode)
    }

    constructor(contractName, abi, bytecode) {
        this.contractName = contractName
        this.abi = abi
        this.bytecode = bytecode

        this.truffleContract = contract({abi: abi, unlinked_binary: bytecode})
    }

    /**
     * set provider
     * @param {Web3} provider
     */
    setProvider(provider) {
        this.truffleContract.setProvider(provider)
        return this
    }
}

let symMyDeployer = Symbol("myDeployer")
let symMyTag = Symbol("myDeployer")

class ContractBoard {

    constructor(contractName, address, deployer) {
        this.contractName = contractName
        this.address = address
        this[deployerSymbol] = deployer
    }

    setTag(tag){
        if(this[deployerSymbol].regBoard(tag, this)) {
            if(!!this[symMyTag]){
                this[deployerSymbol].uregBoard(tag)
            }
            this[symMyTag] = tag
        }
        else{
            console.log(`set tag ${tag} failed: already exist\n${JSON.stringify(this)}`)
        }
    }

    get deployer() {
        this[deployerSymbol]
    }

    get tag() {
        return this[symMyTag]
    }

}

class CDeployer {

    constructor(tag, connStr) {
        this.tag = tag
        this.connStr = connStr
        this.provider = new Web3.providers.HttpProvider(connStr)

        /** @type {{string:ContractBox}} */
        this.boxLst = {}

        /** @type {{string:ContractBoard}} */
        this.boardLst = {}
    }

    /**
     * create box from boxData and insert it to boxLst
     * @param {{contractName, abi, bytecode}} boxData
     */
    createBox(boxData) {
        let box = ContractBox.fromJson(boxData).setProvider(this.provider)
        this.boxLst[box.contractName] = box
    }

    regBoard(tag, board) {
        if(!!this.boardLst[tag]){
            return false
        }
        this.boardLst[tag] = board
        return true
    }

    uregBoard(tag) {
        this.boardLst = undefined
    }

    async deploy(contractName, sender, ...args) {
        let box = this.boxLst[contractName];
        let truffleContract = box.truffleContract

        let truffleDeployer = new Deployer({
            contracts: [truffleContract],
            network: "test",
            network_id: truffleContract.web3.version.network,
            provider: truffleContract.web3.currentProvider
        })

        let gas = truffleContract.web3.eth.estimateGas({data: truffleContract.bytecode})
        truffleDeployer.deploy(truffleContract, ...args, {
            from: sender,
            gas: gas * 1.2 | 0
        })

        let rsp = await truffleDeployer.start();
        return {
            contractName: contractName,
            address: rsp.address,
        }
    }
}

module.exports = CDeployer