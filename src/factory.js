const R = require("ramda")
const fs = require("fs-extra")

const CDeployer = require("./deployer")

/*
factory : factory procedure
dconf.buildPath --> factory
dconf.networks -->|factory| (connStr, ...boxData, ...deployInfo)
||deploy procedure|| of each --> deployedBoards
(dconf.scriptPath, deployedBoards) --> deployedBoards(initiated)
 */

const symDeployers = Symbol("deployers")

/**
 * CFactory
 */
class CFactory {

  constructor(buildPath, networks) {
    this.buildPath = buildPath
    this.networks = networks

    this.boards = {}
    this[symDeployers] = {}
  }

  /**
   * get config by netName
   * @param {string} netName
   * @return {connStr, contracts}
   */
  getNetConf(netName) {
    return this.networks[netName]
  }

  /**
   * get Deployer by netName
   * @param {string} netName
   * @return {CDeployer}
   */
  getDeployer(netName) {
    return this[symDeployers][netName]
  }

  getBoards(netName) {
    return this.boards[netName]
  }

  /**
   * Create a single deployer
   * @param {string} netName
   * @param {string} connStr
   */
  createDeployer(netName, connStr) {
    let org = this.getDeployer(netName)
    if (!org) {
      let deployer = new CDeployer(netName, connStr)
      this[symDeployers][netName] = deployer
      console.log(`factory: create deployer[${deployer.networkName}] succeed. provider : ${deployer.provider.host} ==`)
    } else {
      console.log(`factory: create deployer[${org.networkName}] failed. already exist : ${org.provider.host} ==`)
    }
    this.boards[netName] = {}
  }

  /**
   * create deployer for networks
   * @param {Array<{connStr, contracts, scripts}>} networkConfs
   */
  createDeployers(networkConfs) {
    R.forEachObjIndexed((netConf, netName) => this.createDeployer(netName, netConf.connStr), networkConfs)
  }

  getBoxData(contractStr) {
    return JSON.parse(fs.readFileSync(`${this.buildPath}${contractStr}.json`, 'utf8'))
  }

  async executeInitScript(netName) {
    let netConf = this.getNetConf(netName)
    console.log(`== exec init src of deployer[${netName}] : ${netConf.scripts}`)

    if (!netConf.scripts) {
      return
    }
    for (let i in netConf.scripts) {
      let srcPath = netConf.scripts[i]
      let initMethod = require(`${this.buildPath}${srcPath}`)
      let board = this.getBoards(netName)
      let result = initMethod instanceof Promise ? await initMethod(netName, netConf, board) : initMethod(netName, netConf, board)
      console.log(`==== ${srcPath} executed, result : ${result}`)
    }
  }

  createBoxes(netName) {
    let deployer = this.getDeployer(netName)
    let netConf = this.getNetConf(netName)
    console.log(`== create boxes of deployer[${netName}]`)
    let count = 0
    R.forEachObjIndexed(cConf => {
      if (!!deployer.getBox(cConf.contractStr)) return;
      let result = deployer.createBox(cConf.contractStr, this.getBoxData(cConf.contractStr))
      console.log(`==== ${++count}. box[${cConf.contractStr}] created by deployer[${deployer.networkName}] : ${result}`)
    }, netConf.contracts)
  }

  argmap(args) {
    return args
  }

  async createBoards(netName) {
    let deployer = this.getDeployer(netName)
    let netConf = this.getNetConf(netName)
    console.log(`== create boards of deployer[${netName}]`)
    let count = 0
    for (let tag in netConf.contracts) {
      ++count
      let cConf = netConf.contracts[tag]

      let args = this.argmap(cConf.args)
      console.log(`==== ${count}.a. try deploy ||${tag}|| : ${JSON.stringify(args)}.`)

      let board = (await deployer.deploy(cConf.contractStr, cConf.sender, ...args)).setTag(tag)
      this.boards[netName][tag] = board
      console.log(`==== ${count}.b. ||${tag}|| deployed, board : ${JSON.stringify(board)}`)
    }
    return this.boards[netName]
  }

  async init() {
    this.createDeployers(this.networks)
    for (let name in this[symDeployers]) {
      this.createBoxes(name)
      await this.createBoards(name)
      await this.executeInitScript(name)
    }


    return JSON.stringify(this)
  }
}

module.exports = CFactory
