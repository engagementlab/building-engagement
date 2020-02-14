'use strict';
/**
 * Meetr API server
 * 
 * Activity Intro (City) page Model
 * @module activityintrocity
 * @class activityintrocity
 * @author Johnny Richardson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

var keystone = global.keystone;
var Types = keystone.Field.Types;

/**
 * ActivityIntroCity model
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
var ActivityIntroCity = new keystone.List('ActivityIntroCity', 
	{
		label: 'Activity Intro (City)',
		singular: 'Activity Intro',
		nodelete: true,
		nocreate: true
	});

/**
 * Model Fields
 * @main ActivityIntroCity
 */
ActivityIntroCity.add({
	
	name: { type: String, default: 'Activity Intro (City)', hidden: true, required: true, initial: true },
	instructions: { type: Types.Markdown, required: true, initial: true}
    
});

/**
 * Model Registration
 */
ActivityIntroCity.defaultSort = '-createdAt';
ActivityIntroCity.defaultColumns = 'name';
ActivityIntroCity.register();
