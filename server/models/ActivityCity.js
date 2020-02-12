'use strict';
/**
 * Engagement Journalism API server
 * ActivityCity page Model
 * @module activitycity
 * 
 * @class activitycity
 * @author Johnny Richardson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

var keystone = global.keystone;
var Types = keystone.Field.Types;

/**
 * activitycity model
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
var ActivityCity = new keystone.List('ActivityCity', 
	{
		label: 'Activity (City)',
		singular: 'Activity',
	});

/**
 * Model Fields
 * @main ActivityCity
 */
ActivityCity.add({
	
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
ActivityCity.defaultSort = '-order';
ActivityCity.defaultColumns = 'name, order';
ActivityCity.register();
