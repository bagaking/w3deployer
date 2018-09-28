"using strict"
const Path = require("path")
const cli = require("cli");
const fs = require("fs-extra")
const {CHolder} = require("../")

let out = cli.parse({
    conf: ['c', "config path", "string", "chainConfig"],
    board: ['b', "board file", "string", ""],
});

confPath = Path.join(__dirname, out.conf)
console.log("confPath", confPath, fs.existsSync(confPath))

let {boxPath, networks} = require(confPath)
console.log("boxPath", boxPath)
console.log("networks", networks)

let boardPath = Path.dirname(Path.join(__dirname, out.board, " "))
console.log("boardPath", boardPath)
fs.ensureDirSync(boardPath)

let boardFilePath = Path.join(boardPath, "out.json")
let holder = new CHolder(boxPath, networks, boardFilePath)
holder.init().then(h => {
    h.save()
    console.log("==============================")
    console.log(h.getNet("main"))
})