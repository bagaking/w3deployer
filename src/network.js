const Web3 = require('web3')
const CBox = require("./box")

let symMyProvider = Symbol("myProvider")
let symMyContracts = Symbol("myContracts")

class CNetwork {

    constructor(netName, connStr) {
        this.networkName = netName
        this.connStr = connStr

        this[symMyContracts] = {}
        this[symMyProvider] = new Web3.providers.HttpProvider(connStr)
        // console.log("-- create network provider ", connStr, this.provider)
    }

    get contracts() {
        return this[symMyContracts]
    }

    createBox(boxData) {
        return CBox.fromJson(boxData).setProvider(this.provider)
    }

    createContract(tag, boxData) {
        this[symMyContracts][tag] = this.createBox(boxData).truffleContract
        this[symMyContracts][tag].setProvider(this.provider)
        return this[symMyContracts][tag]
    }

    get provider() {
        return this[symMyProvider]
    }

    getContract(tag){
        return this[symMyContracts][tag]
    }
}

module.exports = CNetwork