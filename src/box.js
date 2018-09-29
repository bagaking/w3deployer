const tContract = require("truffle-contract")

let symTruffleContract = Symbol("truffleContract")

/**
 * you can hold a CBox, and can also using box to create contract
 * @example
 * `CBox.fromJson(netConf.contracts[tag].boxData).setProvider(this._providers[netName]).truffleContract`
 */
class CBox {

  /**
   * create a contract box
   * @param {{contractName, abi, bytecode}} boxData
   * @return {CBox}
   */
  static fromJson(boxData) {
    let {contractName, abi, bytecode} = boxData
    return new CBox(contractName, abi, bytecode)
  }

  constructor(contractName, abi, bytecode) {
    this.contractName = contractName
    this.abi = abi
    this.bytecode = bytecode

    this[symTruffleContract] = tContract({abi: abi, unlinked_binary: bytecode})
  }

  get truffleContract() {
    return this[symTruffleContract]
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

module.exports = CBox
