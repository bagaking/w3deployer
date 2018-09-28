const Web3 = require('web3')
const CBox = require("./box")

let symMyProvider = Symbol("myProvider")

class CNetwork {

    constructor(netName, connStr) {
        this.networkName = netName
        this.connStr = connStr
        this[symMyProvider] = new Web3.providers.HttpProvider(connStr)
    }

    get provider() {
        return this[symMyProvider]
    }

    createBox(boxData) {
        return CBox.fromJson(boxData).setProvider(this.provider)
    }
}

module.exports = CNetwork