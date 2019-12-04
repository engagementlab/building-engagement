/**
 * AppUser Model
 * ==========
 */
const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var appUserSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true
	},
	sub: {
		type: String,
		required: true,
		index: true,
		unique: true
	},
	imgUrl: {
		type: String
	},
	lastLogin: {
		type: Date
	}
});


/**
 * Registration
 */
module.exports = mongoose.model('AppUser', appUserSchema);