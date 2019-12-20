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
	/* 0 = 'Every other week', 
	   1 = 'Once a month', 
	   2 = 'Every other month'
	   3 = 'Every day' (non-production/testing only)
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