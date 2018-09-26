"use strict"

function fillZero(num, digits) {
    return '' + num +(new Array(digits)).fill(0).reduce((a,b)=>a+b, '')
}

module.exports = {
    fillZero
}