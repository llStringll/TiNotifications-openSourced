const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
	name: {type:String, required: false, max: 100},
	regno: {type:String, required:false, max:30},
	email: {type:String, required: false, max: 100},
	password: {type:String, required: false, max: 100},
	role: {type:String, required: false, max: 100},
	subs: {type:String, required: false, max: 1000},
	notifs:{type:Array, required: false},
	subscrips:{type:Array, required: false},
	logout:{type:String, required: false, max: 50},
	bio:{type:String, required: false, max: 200}
});

module.exports = mongoose.model('User', UserSchema);
