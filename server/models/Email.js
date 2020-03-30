'use strict';
/**
 * Meetr API server
 * 
 * Email Content Model
 * @module Email
 * @class Email
 * @author Johnny Richardson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

var keystone = global.keystone;
var Types = keystone.Field.Types;

/**
 * Email model
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
var Email = new keystone.List('Email', 
	{
		label: 'Email Content',
		singular: 'Email Content',
		nodelete: true,
		nocreate: true
	});

/**
 * Model Fields
 * @main Email
 */
Email.add({
	
	name: { type: String, default: 'Email Type', required: true, initial: true, noedit: true },

	subject: { type: String, required: true, initial: true, note: 'Supported recipient variables: [project], [name]' },
	body: { type: Types.Markdown, required: true, initial: true },
	subjectCity: { type: String, label: 'Subject (City)', required: true, initial: true },
	bodyCity: { type: Types.Markdown, label: 'Body (City)', required: true, initial: true },
    
});

/**
 * Model Registration
 */
Email.defaultSort = '-createdAt';
Email.defaultColumns = 'name';
Email.register();
