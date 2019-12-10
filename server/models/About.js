'use strict';
/**
 * Meetr API server
 * 
 * About page Model
 * @module about
 * @class about
 * @author Johnny Richardson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

var keystone = global.keystone;
var Types = keystone.Field.Types;

/**
 * about model
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
var About = new keystone.List('About', 
	{
		label: 'About',
		singular: 'About',
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
 * @main About
 */
About.add({
	
	name: { type: String, default: "About", hidden: true, required: true, initial: true },
	intro: { type: String, required: true, initial: true},
	para1: { type: String, label: 'Paragraph 1', required: true, initial: true},
	para2: { type: String, label: 'Paragraph 2', required: true, initial: true},
	
	what: { type: Types.Markdown, label: 'What', required: true, initial: true },
	why: { type: Types.Markdown, label: 'Why', required: true, initial: true },

	caseStudiesIntro: { type: Types.Markdown, label: 'Case Studies Intro', required: true, initial: true },

	guidePdf: { type: Types.File,  storage: azureFile, label: 'Guide PDF', required: true, initial: true}

});

/**
 * Model Registration
 */
About.defaultSort = '-createdAt';
About.defaultColumns = 'name';
About.register();
