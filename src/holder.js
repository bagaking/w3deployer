'using strict'

const R = require("ramda")
const fs = require("fs-extra")

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
    if(boards === undefined || boards === null) {
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
function mergeBoards(... bs){
    let result = bs.reduce((sum, b) => {
        b = (b || {})
        for(let netName in b){
            let netConf = b[netName]
            if(!sum[netName]){
                sum[netName] = netConf
            } else {
                R.forEachObjIndexed((v, contractStr) => sum[netName][contractStr] = v, netConf)
            }
        }
        return sum
    }, {})
    return result
}

class CHolder extends CFactory {

    constructor(boxPath, networks, cacheFilePath) {
        let netConfsExtra = {}

        if(!fs.existsSync(cacheFilePath)){
            fs.writeFileSync(cacheFilePath, JSON.stringify({}));
        }
        let cacheFile = JSON.parse(fs.readFileSync(cacheFilePath))
        console.log("cacheFile", cacheFile)
        for (let netName in networks) {
            let netConf = networks[netName]
            netConfsExtra[netName] = subNetConf(netConf, cacheFile[netName])
        }
        console.log(netConfsExtra)
        super(boxPath, netConfsExtra)

        this.originCache = cacheFile
    }

    async init(){
        let ret = await super.init()
        //console.log(this.boards, this.originCache)
        this.boards = mergeBoards(this.originCache, this.boards)
        //console.log(this.boards)
        this.originCache = {}
        return ret
    }

}

module.exports = CHolder