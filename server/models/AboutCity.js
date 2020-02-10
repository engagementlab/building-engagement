'use strict';
/**
 * Meetr API server
 * 
 * AboutCity page Model
 * @module aboutcity
 * @class aboutcity
 * @author Johnny Richardson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

var keystone = global.keystone;
var Types = keystone.Field.Types;

/**
 * aboutcity model
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
var AboutCity = new keystone.List('AboutCity', 
	{
		label: 'About (City)',
		singular: 'About (City)',
		nodelete: true,
		nocreate: true
	});

// Storage adapter for Azure
var azureFile = new keystone.Storage({
	adapter: require('keystone-storage-adapter-azure'),
	azure: {
	  container: 'meetr',
	  generateFilename: function (file) {
		// Cleanup filename
		return file.originalname.replace(/[\\'\-\[\]\/\{\}\(\)\*\+\?\\\^\$\|]/g, "").replace(/ /g, '_').toLowerCase();
	  }
	},
	schema: {
	  path: true,
	  originalname: true,
	  url: true
	}
  });

/**
 * Model Fields
 * @main AboutCity
 */
AboutCity.add({
	
	name: { type: String, default: "AboutCity", hidden: true, required: true, initial: true },
	intro: { type: String, required: true, initial: true},
	para1: { type: String, label: 'Paragraph 1', required: true, initial: true},
	para2: { type: String, label: 'Paragraph 2', required: true, initial: true},
	
	what: { type: Types.Markdown, label: 'What', required: true, initial: true },
	why: { type: Types.Markdown, label: 'Why', required: true, initial: true },

	newProject: { type: String, label: 'New Project Form Intro', required: true, initial: true}

});

/**
 * Model Registration
 */
AboutCity.defaultSort = '-createdAt';
AboutCity.defaultColumns = 'name';
AboutCity.register();
