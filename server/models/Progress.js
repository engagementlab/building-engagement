/**
 * Progress Model
 * ==========
 */
const mongoose = require('mongoose'),
Schema = mongoose.Schema;

var progressSchema = new Schema({
	date: {
		type: Date,
        required: true,
        index: true
	},
    project: {
		type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
	},
	responses: {
        type: Array,
        required: true
    },
    note: {
        type: String
    },
    sumX: {
        type: Number,
        required: true
    },
    sumY: {
        type: Number,
        required: true
    }
});


/**
 * Registration
 */
module.exports = mongoose.model('Progress', progressSchema);