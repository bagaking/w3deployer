const path = require('path');

module.exports = {
    entry: {
        w3glue : './src/glue.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    }
};