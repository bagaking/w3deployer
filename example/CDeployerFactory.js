"using strict"

const CDeployer = require("../src/deployer")
const R = require("ramda")
const fs = require("fs")

let chainData = {
  buildPath: `${__dirname}/../localTest/contracts/`,
  networks: {
    main: {
      connStr: "http://127.0.0.1:7545",
      contracts: {
        AB01: {
          sender: "0x373478c2FDaF8D28A91e0c4C2D31EC79596E872E",
          args: ["AB01", "AB01Name", "100000000"],
          contractStr: "Leblock"
        },
        AB02: {
          sender: "0x373478c2FDaF8D28A91e0c4C2D31EC79596E872E",
          args: ["AB01", "AB01Name", "10000000"],
          contractStr: "Leblock"
        },
      }
    }
  }
}


class cDeployerFactory {

  constructor() {

  }

}


function argmap(origin) {
  return origin.map(str => {
    if (str.startsWith("$$")) return dConf.contracts[str.substring(2)].address
    return str //todo : implement {{}}
  })
}

async function load(conf) {

  let all = {}

  console.log(`* loading procedure started. `)
  R.forEachObjIndexed(async (dConf, dName) => {

    console.log(`* config of deployer ${dName} has been found.`)
    let deployer = new CDeployer(dName, dConf.connStr)

    console.log(`== deployer[${deployer.networkName}] has been created. provider : ${deployer.provider.host} ==`)
    R.forEachObjIndexed(async (cConf, tag) => {

      console.log(`==== conf of ßoard ||${tag}|| has been found, try get the box ${cConf.contractStr}. ==`)
      if (!deployer.getBox(cConf.contractStr)) {
        let dataFile = JSON.parse(fs.readFileSync(`${chainData.buildPath}${cConf.contractStr}.json`, 'utf8'))
        let result = deployer.createBox(cConf.contractStr, dataFile)
        console.log(`==== - deployer[${deployer.networkName}] created box[${cConf.contractStr}] : ${result}`)
      } else {
        console.log(`==== - deployer[${deployer.networkName}] found box[${cConf.contractStr}]`)
      }

      let args = argmap(cConf.args)

      console.log(`==== - arguments prepared : ${args}, start deploy.`)
      let board = (await deployer.deploy(cConf.contractStr, cConf.sender, ...args)).setTag(tag)

      console.log(`===> ßoard[${board.tag}] deployed : ${JSON.stringify(board)}`)
    }, dConf.contracts)

    all[dName] = deployer.boardLst
  }, conf.networks)

  return all
}

load(chainData).then()
