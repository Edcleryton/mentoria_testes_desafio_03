// utils/logger.js
console.log('DEBUG env:', process.env.DEBUG);
const DEBUG_MODE = process.env.DEBUG === 'true';

function logDebug(...args) {
	if (DEBUG_MODE) {
		console.log(...args);
	}
}

module.exports = { logDebug };
