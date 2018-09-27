module.exports = (...args) => {
  for(let i in args){
    console.log(args[i].prototype)
    console.log(JSON.stringify(args[i]))
  }
}
