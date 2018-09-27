'using strict'

const Path = require("path")

let chainConfig = {
    boxPath: Path.join(__dirname, "./contracts/"),
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
            },
            scripts: [ "testInit" ]
        }
    }
}

module.exports = chainConfig