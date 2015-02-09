"use strict";

var Promise = require('bluebird');
var ip = require('ip');
var ssdp = require('node-ssdp');

var SkyPlusHDBox = require('./sky-plus-hd_box');
var SkyPlusHDError = require('./sky-plus-hd_error');
var SkyPlusHDServiceDefinitions = require('./sky-plus-hd_service-definitions');

/**
 * SkyPlusHDFinder
 * @class
 */
var SkyPlusHDFinder = function() {

	var self = this;
	var _timeout = 5000;

	/**
	 * Find a SkyPlusHD box on the local network.
	 * @param {String} [ipAddress] - search for SkyPlusHD box with the specified IP address.
	 * @returns {Promise.<SkyPlusHDBox, Error>} - Returns a promise which resolves to a SkyPlusHDBox if one is found
	 */
	this.findBox = function (ipAddress) {
		return new Promise(function(resolve, reject) {
			/* Search for SkyRC service THEN search for SkyBrowse with the same IP to ensure both results
				are from the same box */
			var getSkyRC = discoverService(SkyPlusHDServiceDefinitions.SkyRC, ipAddress);
			var getSkyBrowse = getSkyRC.then(function(skyRC) {
				return discoverService(SkyPlusHDServiceDefinitions.SkyBrowse, skyRC.rInfo.address);
			});
			Promise.props({
				skyRC:getSkyRC,
				skyBrowse:getSkyBrowse
			}).then(function(responses) {
				var box = new SkyPlusHDBox({
					ip: responses.skyRC.rInfo.address,
					port: responses.skyRC.rInfo.port,
					xml: [responses.skyRC.headers.LOCATION, responses.skyBrowse.headers.LOCATION]
				});
				box.init().then(function() {
					resolve(box);
				}).catch(reject);
			}).catch(reject);
		});
	};

	/**
	 * Search for ssdp services
	 * @private
	 * @param {String} serviceUrn - ssdp URN to search for
	 * @param {String} [ipAddress] - service IP must match specified IP
	 * @returns {Promise.<Object, Error>} - Promise which resolves to an Object containing IP and service msg
	 */
	function discoverService(serviceUrn, ipAddress) {
		return new Promise(function(resolve, reject) {
			var ssdpClient = new ssdp.Client();
			/* Set a timer to reject the promise after a while, to act as a timeout */
			var timeoutTimer = setTimeout(function() {
				ssdpClient._stop();
				reject(
					ipAddress ?
					new SkyPlusHDError.TimeoutError("Service '%s' not found at ip address '%s'",serviceUrn, ipAddress) :
					new SkyPlusHDError.TimeoutError("Service '%s' not found",serviceUrn)
				);
			},_timeout);
			ssdpClient.on('response', function(headers, statusCode, rInfo) {
				/* If ipAddress param is present, check if the response matches */
				if (!ipAddress || ip.isEqual(rInfo.address,ipAddress)) {
					clearTimeout(timeoutTimer);
					ssdpClient._stop();
					resolve({
						headers: headers,
						rInfo: rInfo
					});
				}
			});
			ssdpClient.search(serviceUrn);
		});
	}
};

module.exports = SkyPlusHDFinder;