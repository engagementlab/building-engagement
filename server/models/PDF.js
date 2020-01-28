'use strict';
/**
 * Meetr API server
 * 
 * PDF pre-filled text Model
 * @module pdf
 * @class pdf
 * @author Johnny Richardson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

var keystone = global.keystone;
var Types = keystone.Field.Types;

/**
 * pdf model
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
var PDF = new keystone.List('PDF', 
	{
		label: 'PDF Text',
		singular: 'PDF Text',
		nodelete: true,
		nocreate: true
	});

/**
 * Model Fields
 * @main PDF
 */
PDF.add({
	
	name: { type: String, default: "PDF Text", hidden: true, required: true, initial: true },
	intro: { type: String, label: 'Meetr Intro', required: true, initial: true},
	explanation: { type: Types.Textarea, label: 'How it works', required: true, initial: true}
    
});

/**
 * Model Registration
 */
PDF.defaultSort = '-createdAt';
PDF.defaultColumns = 'name';
PDF.register();
