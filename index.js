"use strict";
var emailValidator = require("email-validator");
var request = require('request');
var api = require('./secrets.json');
var CATEGORY_ID = 16;
var config = {
	category_id: 16,
	welcome_msg: "",
	groups: "arma3",
};

/**
 * Notify Recruiters of a new member registration
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
exports.verify_registration_data = function(req, res) {
	var IS_TEST;
	var data;

	data = req.body;
	IS_TEST = data.test || false;


	if (checkDataExists(data) && verifyData(data) === 0) {
		makePost(data);
		res.status(200);
	} else {
		res.status(400);

	}

	return;

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

		return 0;
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
		return data.hasOwnProperty(prop) && typeof data[prop] !== "undefined" && data[prop].toString().trim().length > 0;
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
			"category": config.category_id,
		};

		if (IS_TEST) {
			console.log(formData);
			return;
		}

		request.post({
			url: api_url + "/posts",
			"form": formData
		}, function(err, httpResponse, body) {});

	}

	/**
	 * Generate Discourse forum invite link
	 */
	function generateInvitation(data) {
		var formData = {
			// Pass a simple key-value pair 
			"api_key": api.discourse.key,
			"api_username": api.discourse.user,

			// Topic title and body. Include steam ID from custom fields
			"email": data.email,
			"group_names": config.groups,
			"custom_message": config.welcome_msg,
		};

		request.post({
			url: api_url + "/invites/link",
			"form": formData
		}, function(err, httpResponse, body) {});
	}

};