'use strict';
/**
 * Meetr API server
 * 
 * Activity Intro page Model
 * @module ActivityIntro
 * @class ActivityIntro
 * @author Johnny Richardson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

var keystone = global.keystone;
var Types = keystone.Field.Types;

/**
 * ActivityIntro model
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
var ActivityIntro = new keystone.List('ActivityIntro', 
	{
		label: 'Activity Intro',
		singular: 'Activity Intro',
		nodelete: true,
		nocreate: true
	});

/**
 * Model Fields
 * @main ActivityIntro
 */
ActivityIntro.add({
	
	name: { type: String, default: 'Activity Intro', hidden: true, required: true, initial: true },
	instructions: { type: Types.Markdown, required: true, initial: true}
    
});

/**
 * Model Registration
 */
ActivityIntro.defaultSort = '-createdAt';
ActivityIntro.defaultColumns = 'name';
ActivityIntro.register();
