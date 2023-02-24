const mongoose = require("mongoose");
const validator = require('validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { type } = require("os");

const userSchema = new mongoose.Schema({
    rolee: {
        type: String,
        default: "user"
    },
    name: {
        type: String,
        required: [true, 'please enter your name'],
        maxLength: [30, 'Name cannot exceed 30 characters'],
        minLength: [4, 'Name should have more than 4 characters']
    },
    email: {
        type: String,
        required: [true, 'please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'please enter valid email']
    },
    password: {
        type: String,
        required: [true, 'please enter your password'],
        minLength: [8, 'password should ge greter than 8 character'],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },

    resetPassword: String,
    resetPasswordToken: Date

})
console.log(typeof "rolee");
userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) {
        next() // if password was not modified
    }
    this.password = await bcrypt.hash(this.password, 10) //if update then encrypt again
});

//Jwt token . generate token and store in cookie
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,

    })
}

//compare password

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
// generating password reset
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;


}


module.exports = mongoose.model('User', userSchema);