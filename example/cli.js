"using strict"
const Path = require("path")
const cli = require("cli");
const fs = require("fs-extra")
const {CFactory} = require("../")

let out = cli.parse({
    conf: ['c', "config path", "string", "chainConfig"],
    board: ['b', "board file", "string", ""],
});

confPath = Path.join(__dirname, out.conf)
console.log("confPath", confPath, fs.existsSync(confPath))

let {buildPath, networks} = require(confPath)
console.log("buildPath", buildPath)
console.log("networks", networks)

let boardPath = Path.dirname(Path.join(__dirname, out.board, " "))
console.log("boardPath", boardPath)
fs.ensureDirSync(boardPath)

let factory = new CFactory(buildPath, networks)
factory.init().then(f => {
    fs.writeFileSync(Path.join(boardPath, "out.json"), JSON.stringify(f.boards, null, 4));
})