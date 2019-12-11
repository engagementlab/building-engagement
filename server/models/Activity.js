'use strict';
/**
 * Engagement Journalism API server
 * Activity page Model
 * @module activity
 * 
 * @class activity
 * @author Johnny Richardson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

var keystone = global.keystone;
var Types = keystone.Field.Types;

/**
 * activity model
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
var Activity = new keystone.List('Activity', 
	{
		label: 'Activity',
		singular: 'Activity',
		nodelete: true
	});

/**
 * Model Fields
 * @main Activity
 */
Activity.add({
	
	name: { type: String, required: true, initial: true },
	order: { type: Types.Select, label: 'Order on Page', options: '1, 2, 3, 4', required: true, initial: true},
	intro: { type: String, label: 'Intro Text', required: true, initial: true},
    steps: { type: Types.Select, label: 'Number of Steps', options: '1, 2, 3, 4, 5', required: true, initial: true},
    step1: { type: Types.Markdown, dependsOn: { steps: ['1', '2', '3', '4', '5'] } },
    step2: { type: Types.Markdown, dependsOn: { steps: ['2', '3', '4', '5'] } },
    step3: { type: Types.Markdown, dependsOn: { steps: ['3', '4', '5'] } },
    step4: { type: Types.Markdown, dependsOn: { steps: ['4', '5'] } },
    step5: { type: Types.Markdown, dependsOn: { steps: '5' } }
});

/**
 * Model Registration
 */
Activity.defaultSort = '-order';
Activity.defaultColumns = 'name, order';
Activity.register();
