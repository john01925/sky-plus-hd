var util = require('util');

var SkyPlusHDError = {}

var errorTypes = [
	'TimeoutError'
];

for (var iError in errorTypes) {
	(function(errorType) {
		SkyPlusHDError[errorType] = function(message){
			if (arguments.length > 1) {
				message = util.format.apply(util,arguments);
			};
			//
			this.message = message;
			this.name = errorType;
			Error.captureStackTrace(this, SkyPlusHDError[errorType]);
		};
		SkyPlusHDError[errorType].prototype = Object.create(Error.prototype);
	})(errorTypes[iError])
};

module.exports = SkyPlusHDError;