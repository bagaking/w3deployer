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

    constructor(contractStr, address, deployer) {
        this.contractStr = contractStr
        this.address = address
        this[symMyDeployer] = deployer
    }

    setTag(tag){
        if(this[symMyDeployer].regBoard(tag, this)) {
            if(!!this[symMyTag]){
                this[symMyDeployer].uregBoard(tag)
            }
            this[symMyTag] = tag
        }
        else{
            console.log(`set tag ${tag} failed: already exist\n${JSON.stringify(this)}`)
        }
        return this
    }

    get deployer() {
        this[symMyDeployer]
    }

    get tag() {
        return this[symMyTag]
    }

}

let symMyProvider = Symbol("myProvider")
let symMyBoxLst = Symbol("myBoxLst")

class CDeployer {

    constructor(networkName, connStr) {
        this.networkName = networkName
        this.connStr = connStr
        this[symMyProvider] = new Web3.providers.HttpProvider(connStr)

        /** @type {{string:ContractBox}} */
        this[symMyBoxLst] = {}

        /** @type {{string:ContractBoard}} */
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
        let box = ContractBox.fromJson(boxData).setProvider(this.provider)
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
     * @return {Promise<ContractBoard>}
     */
    async deploy(contractStr, sender, ...args) {
        let box = this.getBox(contractStr);
        let truffleContract = box.truffleContract

        let truffleDeployer = new Deployer({
            contracts: [truffleContract],
            network: "test",
            network_id: truffleContract.web3.version.network,
            provider: truffleContract.web3.currentProvider
        })

        let gas = truffleContract.web3.eth.estimateGas({data: truffleContract.bytecode})

        console.log(args)
        truffleDeployer.deploy(truffleContract, ...args, {
            from: sender,
            gas: gas * 1.2 | 0
        })
        console.log(1)
        let rsp = await truffleDeployer.start();
        return new ContractBoard(contractStr, rsp.address, this)
    }
}

module.exports = CDeployer