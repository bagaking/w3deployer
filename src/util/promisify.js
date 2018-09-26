/**
 * @fileOverview provide promisify functions the caller by the way
 * @author kinghand
 * @version 1.0.0
 */

let Promisify = (fn, receiver = null) => {
    return (...args) => {
        return new Promise((resolve, reject) => {
            let cb = (err, res) => {
                return err ? reject(err) : resolve(res)
            }
            if(receiver === null){
                fn(...args, cb)
            } else {
                fn.call(receiver, ...args, cb)
            }
        })
    }
}

/**
 * Call a function, with no receiver, and return the promise
 * @param {function} fn - the last argument of this function should be callback
 * @param {...any} args - arguments
 * @returns {Promise<void>}
 */
let PromiseFunctionCall = (fn, ...args) => {
    return Promisify(fn)(...args)
}

/**
 * Call a method, with a receiver, and return the promise
 * @param {function} fn -  the last argument of this function should be callback
 * @param {Object} receiver - the receiver(`this`) of this function
 * @param {...any} args - arguments
 * @returns {Promise<void>}
 */
let PromiseMethodCall = (fn, receiver, ...args) => {
    return Promisify(fn, receiver)(...args)
}

module.exports = {
    Promisify,

    PromiseFunctionCall,

    PromiseMethodCall
}