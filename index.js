"use strict";

/**
 * Notify Recruiters of a new member registration
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
 exports.verify_registration_data = function (req, res) {
	var emailValidator = require("email-validator");
	var request = require('request');
	var api = require('./secrets.json');
	var data;

	data = req.body;

	function verifyData(data){
		if(!data.agecheck){
			return "Age verification failed";
		}

		if(!data.rulescheck){
			"Rules verification failed";
		}

		//check username free
		//TODO not sure this works. Maybe make it a promise?
		return request.get({
			baseUrl: api.url,
			uri: "/users/" + data.username + ".json",

		}, function(err, res, body){
			return res.statusCode === 404;
		});
	}

	/**
	 * Ensure all required fields are present
	 */
	 function checkDataExists(data){
		var ret = {};
		var properties =[
			"username",
			"whyjoin",
			"email",
			"experience",
			"agecheck",
			"rulescheck",
		];

		for(var i=0; i<properties.length; i++){
			if(!checkProperty(data, properties[i])) return false;
		}

		return emailValidator.validate(data.email);
	 }

	 function checkProperty(data, prop){
		return data.hasOwnProperty(prop) || data[prop].trim().length > 0;
	 }

};
