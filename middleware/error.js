const ErrorHandler = require('../util/errorHandler')

module.exports = (err, req, res, next) => {

    err.statuscode = err.statuscode || 500;
    err.message = err.message || `internal server error`

    // mongodb id error
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid : ${err.path}`;
        err = new ErrorHandler(message, 404)
    }
    // mongo db duplicate key error
    if (err.code === 10000) {
        const message = `duplicate ${Object.keys(err.keyvalue)} Entered`
        err = new ErrorHandler(message, 400)
    }

    //wrong jwt errors
    if (err.name === `jsonwebtoken error`) {
        const message = `json web token is invalid try ,again`;
        err = new ErrorHandler(message, 400);
    }

    //jwt expire error

    if (err.name === 'token expire error') {
        const message = `json web token is error , try again`;
        err = new ErrorHandler(message, 400)

    }

    res.status(err.statuscode).json({
        success: false,
        message: err.message
    })
}