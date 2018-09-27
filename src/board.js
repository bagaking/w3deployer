let symMyDeployer = Symbol("myDeployer")
let symMyTag = Symbol("symMyTag")

class CBoard {

  constructor(contractStr, address, deployer) {
    this.contractStr = contractStr
    this.address = address
    this[symMyDeployer] = deployer
  }

  setTag(tag) {
    if (this[symMyDeployer].regBoard(tag, this)) {
      if (!!this[symMyTag]) {
        this[symMyDeployer].uregBoard(tag)
      }
      this[symMyTag] = tag
    }
    else {
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

module.exports = CBoard
