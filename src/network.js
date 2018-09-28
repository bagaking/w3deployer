const Web3 = require('web3')
const CBox = require("./box")

let symMyProvider = Symbol("myProvider")
let symMyContracts = Symbol("myContracts")

class CNetwork {

    constructor(netName, connStr) {
        this.networkName = netName
        this.connStr = connStr
        this[symMyProvider] = new Web3.providers.HttpProvider(connStr)
        this[symMyContracts] = {}
    }

    get provider() {
        return this[symMyProvider]
    }

    get contracts() {
        return this[symMyContracts]
    }

    createBox(boxData) {
        return CBox.fromJson(boxData).setProvider(this.provider)
    }

    createContract(tag, boxData) {
        this[symMyContracts][tag] = this.createBox(boxData).truffleContract
        return this[symMyContracts][tag]
    }

    getContract(tag){
        return this[symMyContracts][tag]
    }
}

module.exports = CNetwork