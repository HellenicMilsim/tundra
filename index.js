"use strict";

/**
 * Notify Recruiters of a new member registration
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
 exports.register_ntf = function register_ntf(req, res) {
 	var request = require('request');
 	var api = require('./secrets.json');
 	var steamid;
 	var username;
 	var api_url = api.discourse.url;

 };
 