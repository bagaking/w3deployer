"using strict"

const { CFactory } = require("../")

let {boxPath, networks} = require("./chainConfig")
let factory = new CFactory(boxPath, networks)

factory.start().then(f => {
})

