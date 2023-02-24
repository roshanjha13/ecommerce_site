const ErrorHandler = require('../util/errorHandler');
const catchAsyncError = require('./catchAsyncError');
const jwt = require("jsonwebtoken")
const User = require('../models/userModel')
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(new ErrorHandler('please login to access this resource', 401));

    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    next()
})

exports.authorizeRoles = (...roles) => {

    return (req, res, next) => {

        if (!roles.includes(req.user.rolee)) {
            return next(new ErrorHandler(
                `Role :${req.user.rolee} is not allowed to acces this resource`
                , 403));

        }
        next();
    }
}