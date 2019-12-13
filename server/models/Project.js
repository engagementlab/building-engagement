/**
 * Project Model
 * ==========
 */
const mongoose = require('mongoose'),
Schema = mongoose.Schema;

var projectSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true,
    },
	reminderEmail: {
		type: String
	},
	/* 0 = 'Once a week', 
	   1 = 'Every other week', 
	   2 = 'Once a month', 
	   3 = 'Every other month'
	*/
	reminderPeriod: {
		type: Number
	},
	lastReminderDate: {
		type: Date
	},
	reminderEndDate: {
		type: Date
	},
    user: {
		type: Schema.Types.ObjectId,
		ref: 'AppUser'
	},
	slug: {
		type: String
	}
});


/**
 * Registration
 */
module.exports = mongoose.model('Project', projectSchema);