const fs = require("fs-extra")

module.exports = (netName, network, board) => {
  console.log(JSON.stringify(network, null, 4))
  fs.writeFileSync(`${__dirname}/${netName}_board.out`, JSON.stringify(board, null, 2));
}
