"using strict"

const { CFactory } = require("../")

let {buildPath, networks} = require("./chainConfig")
let factory = new CFactory(buildPath, networks)

factory.init().then(f => {
})

