'using strict'

const R = require("ramda")
const fs = require("fs-extra")

const CNetwork = require('./network')
const CFactory = require("./factory")

/*
### holder : ensure procedure

1. deployedBoards(initiated) --> |holder| --> dconfExtra
2. **||factory procedure||** for dconfExtra -->  deployedBoardsExtra(initiated)
3. (deployedBoards(initiated), deployedBoardsExtra(initiated)) --> deployedBoards(ensured)

### holder: holder procedure

1. **|| holder procedure (ensure) ||** --> deployedBoards(ensured)
2. deployedBoards(ensured) --> |holder| reactors
 */


/**
 * subNetConf
 * @param {{connStr, contracts, scripts}} netConf
 * @param {contractStr, address} boards
 * @constructor
 */
function subNetConf(netConf, boards = undefined) {
    if (boards === undefined || boards === null) {
        return netConf
    }
    let {connStr, contracts, scripts} = netConf
    let netConfExtra = {connStr, contracts: {}, scripts}
    for (let contractStr in contracts) {
        if (!boards[contractStr]) {
            netConfExtra.contracts[contractStr] = contracts[contractStr]
        }
    }
    return netConfExtra
}

/**
 * mergeBoards
 * @param {...{contractStr, address}} bs
 * @return {{contractStr, address}}
 */
function mergeBoards(...bs) {
    let result = bs.reduce((sum, b) => {
        b = (b || {})
        for (let netName in b) {
            let netConf = b[netName]
            if (!sum[netName]) {
                sum[netName] = netConf
            } else {
                R.forEachObjIndexed((v, contractStr) => sum[netName][contractStr] = v, netConf)
            }
        }
        return sum
    }, {})
    return result
}

class CHolder {

    constructor(boxPath, networks, cacheFilePath) {
        this._networks = {}
        this._contracts = {}
        this._netConfsExtra = {}
        this.boxPath = boxPath
        this.cacheFilePath = cacheFilePath

        if (!fs.existsSync(cacheFilePath)) fs.writeFileSync(cacheFilePath, JSON.stringify({}));
        this.boards = JSON.parse(fs.readFileSync(cacheFilePath))

        for (let netName in networks) {
            let netConf = networks[netName]
            this._netConfsExtra[netName] = subNetConf(netConf, this.boards[netName])
        }
        console.log("netConfsExtra", this._netConfsExtra)

        this.factoryExtra = new CFactory(boxPath, this._netConfsExtra)

        for (let netName in networks) {
            let netConf = networks[netName]
            this._networks[netName] = new CNetwork(netName, netConf.connStr)
            this._contracts[netName] = this._contracts[netName] || {}
            for (let tag in netConf.contracts) {
                let contractConf = netConf.contracts[tag]
                let boxData = JSON.parse(fs.readFileSync(`${this.boxPath}${contractConf.contractStr}.json`, 'utf8'))
                this._contracts[netName][tag] = this._networks[netName].createBox(boxData).truffleContract
            }
        }
    }

    async init() {
        let ret = await this.factoryExtra.init()
        this.boards = mergeBoards(this.boards, this.factoryExtra.boards)
        for (let netName in this._contracts) {
            let net = this._contracts[netName]
            for (let tag in net) {
                net[tag].at(this.boards[netName][tag].address)
            }
        }
        return this
    }

    save() {
        fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.boards, null, 4));
    }

    get contracts(){
        return this._contracts
    }


}

module.exports = CHolder