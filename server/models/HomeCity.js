'use strict';
/**
 * Meetr API server
 *
 * HomeCity page Model
 * @module homecity
 * @class homecity
 * @author Johnny Richardson
 *
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

var keystone = global.keystone;
var Types = keystone.Field.Types;

/**
 * homecity model
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
var HomeCity = new keystone.List('HomeCity',
	{
		label: 'Home (City)',
		singular: 'Home',
		nodelete: true,
		nocreate: true
	});

/**
 * Model Fields
 * @main HomeCity
 */
HomeCity.add({

	name: { type: String, default: "Home (City)", hidden: true, required: true, initial: true },
	tagline: { type: Types.Text, required: true, initial: true},
	screen1: { type: Types.Markdown, label: 'How it works', required: true, initial: true},

	talk: { type: Types.Text, label: 'Talk it out', required: true, initial: true},
	track: { type: Types.Text, label: 'Track your progress', required: true, initial: true},

	visualize: { type: Types.Text, label: 'Visualize Engagement', required: true, initial: true },

	why: { type: Types.Markdown, label: 'Why Meetr?', required: true, initial: true},
	what: { type: Types.Markdown, label: 'What is engaged journalism?', required: true, initial: true}

});

/**
 * Model Registration
 */
HomeCity.defaultSort = '-createdAt';
HomeCity.defaultColumns = 'name';
HomeCity.register();
