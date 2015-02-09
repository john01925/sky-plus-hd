var SkyPlusHD = require('../..');

var findABox = SkyPlusHD.findBox();

findABox.then(function(box) {
	console.log();
	console.log("Found a SkyPlusHD box!");
	console.log("        IP:",box.ip);
	console.log("     MODEL:",box.model);
	console.log("  CAPACITY:",box.capacity);
	console.log("  SOFTWARE:",box.software);
	console.log("    SERIAL:",box.serial);
	console.log("    PHOTOS:",box.supportsPhotoViewing ? 'Yes' : 'No');
	console.log();
}).catch(function(e) {
	console.log("%s",e);
});