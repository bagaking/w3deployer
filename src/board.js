let symMyContract = Symbol("symMyContract")

class CBoard {

    constructor(contractStr, address, tContract) {
        this.contractStr = contractStr
        this.address = address

        /** @type {tContract} */
        this[symMyContract] = tContract
    }

    get contract() {
        return this[symMyContract]
    }

}

module.exports = CBoard
