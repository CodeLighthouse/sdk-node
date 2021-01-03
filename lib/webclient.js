const axios = require('axios');

class WebClient {

	constructor(organization_name, api_key, base_url="https://codelighthouse.io", version="v1",
				debug=false) {

		// TOGGLE DEBUGGING
		this.debug = debug;

		// CONFIGURE HTTP CLIENT
		this.axios_instance = axios.create({
			baseURL: `${base_url}/${version}`,
			headers: {
				'User-Agent': 'CodeLighthouse',
				'Content-Type': 'application/json',
				'organization': organization_name,
				'x-api-key': api_key
			}
		});

	}

	// SEND ERROR
	send_error(codelighthouse_error) {

		// MAKE THE WEBREQUEST
		this.axios_instance.post('/error', codelighthouse_error)
			.then(response => {

				let response_status = response.status; 	// GET NUMERICAL STATUS CODE
				let response_data = response.data;		// GET JSON DATA FROM RESPONSE

				// DO DEBUGGING LOGGING IF ERROR CODE OR DEBUG
				console.log(`CODELIGHTHOUSE: returned status code ${response_status}`);
				if (response_status === 429) {
					console.log(`CODELIGHTHOUSE: you have reached your rate limit of errors for the month. Please upgrade your plan for more.`)
				}
				else if (response_status === 200 || response_status === 201) {
					console.log(`CODELIGHTHOUSE: error_guid=${response_data['error_guid']}`)
				}
				else if (response_status !== 200 && response_status !== 201 && response_status !== 429) {
					console.log(`CODELIGHTHOUSE: returned message ${response_data}`);
					console.log('Please contact CodeLighthouse support for help - hello@codelighthouse.io')
				}
				else if (self.debug) {
					console.log(`CODELIGHTHOUSE: returned message ${response_data}`);
				}
			})
			.catch(err => {
				console.log(`CODELIGHTHOUSE: An error occurred when trying to send an error to CodeLighthouse: ${err}`);
			})
	}
}

module.exports = WebClient;