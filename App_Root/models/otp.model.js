const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OTPSchema = new Schema({
	otp: {type:String, required: true}
});

module.exports = mongoose.model('OTP', OTPSchema);
