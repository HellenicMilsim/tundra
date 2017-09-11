"use strict";
var emailValidator = require("email-validator");
var request = require('request');
var api = require('./secrets.json');
var CATEGORY_ID = 16;

/**
 * Notify Recruiters of a new member registration
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
exports.verify_registration_data = function(req, res) {
	var data;

	data = req.body;

	function verifyData(data) {
		if (!data.agecheck) {
			return "Age verification failed";
		}

		if (!data.rulescheck) {
			return "Rules verification failed";
		}

		//check username free
		//TODO not sure this works. Maybe make it a promise?
		return request.get({
			baseUrl: api.url,
			uri: "/users/" + data.username + ".json",

		}, function(err, res, body) {
			return res.statusCode === 404;
		});
	}


	/**
	 * Ensure all required fields are present
	 */
	function checkDataExists(data) {
		var properties = [
			"username",
			"whyjoin",
			"email",
			"steamid",
			"experience",
			"expectations",
			"agecheck",
			"rulescheck",
		];

		for (var i = 0; i < properties.length; i++) {
			if (!checkProperty(data, properties[i])) return false;
		}

		return emailValidator.validate(data.email);
	}

	function checkProperty(data, prop) {
		return data.hasOwnProperty(prop) || data[prop].trim().length > 0;
	}


	/**
	 * Compose forum post body text
	 */
	function composeRaw(data) {
		return "Νέος χρήστης [" + data.username + "]\n\nSteam ID: " + data.steamid + "\n\n" +
			"Εμπειρία:\n>" + data.experience + "\n\nΠροσδοκίες:\n>" + data.expectations;
	}


	/**
	 * Post new user info to the forum
	 */
	function makePost(data) {
		var formData = {
			// Pass a simple key-value pair 
			"api_key": api.discourse.key,
			"api_username": api.discourse.user,

			// Topic title and body. Include steam ID from custom fields
			"title": "Νεα Εγγραφή: " + username,
			"raw": composeRaw(data),
			"category": CATEGORY_ID
		};

		request.post({
			url: api_url + "/posts",
			"form": formData
		}, function(err, httpResponse, body) {});

	}


};