const ErrorHandler = require('../util/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const User = require('../models/userModel');
const sendToken = require('../util/jwtToken');
const sendEmail = require('../util/sendEmail')
const crypto = require('crypto')

// Register user

exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: 'this is a sample id',
            url: 'profileUrl'
        },
    })
    // const token = user.getJWTToken();
    // res.status(201).json({
    //     success: true,
    //     token,
    // })
    sendToken(user, 201, res)

});

exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    //checking if user has given password and email both
    if (!email || !password) {
        return next(new ErrorHandler("please enter valid email and password", 400))

    }
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
        return next(new ErrorHandler('invalid email or password', 401))
    }

    const isPassWordMatched = await user.comparePassword(password)
    // if password not match

    if (!isPassWordMatched) {
        return next(new ErrorHandler('invalid email or password', 401))
    }


    sendToken(user, 200, res)

})

exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })
    res.status(200).json({
        success: true,
        message: "logged out successfully"
    })
})

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new ErrorHandler('User not found', 404));

    }
    // getPassword Token

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false })

    const resetPasswordUrl = `${req.protocol}//${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message = `your password reset token is :\n\n ${resetPasswordUrl} \n\n if you have not requested this email,then please ignore it`

    try {

        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `email sent to ${user.email} successfully`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500))
    }

})

// reset password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    // creating token hash

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');


    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },

    })
    if (!user) {
        return next(
            new ErrorHandler(
                "Reset password token is invalid or has been expired", 400
            )
        );
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('password does not match', 400))
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
})

exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user,
    })

})

exports.updateUserPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");


    const isPassWordMatched = user.comparePassword(req.body.oldPassword)
    // if password not match

    if (!isPassWordMatched) {
        return next(new ErrorHandler('old password is incorrect', 400))
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler(' password does not match', 400))
    }

    user.password = req.body.newPassword;

    await user.save()

    sendToken(user, 200, res)

    res.status(200).json({
        success: true,
        user,
    })

})

exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        userFindAndModify: false,
    })

    res.status(200).json({
        success: true,

    })


})
// get all users(admin)

exports.getAllUser = catchAsyncError(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})

exports.getSingleUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`user doesnot exist with this id:${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
})

// update user role -- ADmin

exports.updateUserRole = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        rolee: req.body.rolee
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        userFindAndModify: false,
    })

    res.status(200).json({
        success: true,

    })


})

// delete user role -- ADmin

exports.deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorHandler(`user not found ${req.params.id}`, 401))
    }

    await user.remove()

    res.status(200).json({
        success: true,

    })


})

