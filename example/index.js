"using strict"
const cli = require("cli");

let out = cli.parse({
    load: ['l', "example name", "string", "deployTest"],
});

console.log("start load : ", out.load, "\n")

require(`./${out.load}`)