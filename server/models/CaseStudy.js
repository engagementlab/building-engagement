'use strict';
/**
 * Meetr API server
 * 
 * CaseStudy page Model
 * @module casestudy
 * @class casestudy
 * @author Johnny Richardson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

var keystone = global.keystone;
var Types = keystone.Field.Types;

/**
 * casestudy model
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
var CaseStudy = new keystone.List('CaseStudy', 
	{
		label: 'Case Studies',
		singular: 'Case Study'
	});

/**
 * Model Fields
 * @main CaseStudy
 */
CaseStudy.add({
	
	name: { type: String, default: "Case Study", hidden: true, required: true, initial: true },
	description: { type: Types.Text, required: true, initial: true},
	url: { type: Types.Url, label: 'URL', required: true, initial: true}

});

/**
 * Model Registration
 */
CaseStudy.defaultSort = '-createdAt';
CaseStudy.defaultColumns = 'name, url';
CaseStudy.register();
