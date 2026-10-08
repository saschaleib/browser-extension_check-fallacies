
const $opt = {
	init: function() {
		console.info("$opt.init()");

		// load the preferences, if applicable:
		$opt.loadPrefs();

		// assign callbacks:
		document.getElementById('modelSelector')
			.addEventListener('change', $opt.onModelsListChange);
		
		document.getElementById('modelsButton')
			.addEventListener('click', $opt.onModelsButtonClick);

		document.getElementById('testButton')
			.addEventListener('click', $opt.onTestButtonClick);
		
		document.getElementById('saveButton')
			.addEventListener('click', $opt.onSaveButtonClick);
	},

	loadPrefs: function () {
		console.info("$opt.loadPrefs()");

		// load the settings asynchronously:
		(async () => {
			const result = await $opt._retrieveSettings();
			if (result._valid !== false) {

				if (!result._valid) { // = undefined
					// set default values:
					result.data = {
						type: 'openai',
						server: 'http://localhost:1234/v1/',
						apiKey: '',
						model: 'swift-qwen3.8-27b'
					}
				}

				// Server type:
				if (result.data.type !== '') {
					const typeSel = document.getElementById('typeSelector');
					for (var i = 0; i < typeSel.options.length; i++) {
						if (typeSel.options[i].text== result.data.type.trim()) {
							typeSel.options[i].selected = true;
						}
					}
				}

				// API Endpoint:
				if (result.data.server.trim() !== '') {
					document.getElementById('serverField').value = result.data.server;
				}

				// API Key
				if (result.data.apiKey.trim() !== '') {
					document.getElementById('apiKeyField').value = result.data.apiKey;
				}

				// model ID
				if (result.data.model.trim() !== '') {
					document.getElementById('modelField').value = result.data.model;
				}
				
			} else {
				$opt.setInfo('error', result._error);
			}
		})();
	},

	onModelsButtonClick: function(e) {
		console.info("$opt.onModelsButtonClick()");
		
		const data = $opt._readFormData(true);
		if (data._valid) {

			// get the required elements:
			const modelSel = document.getElementById('modelSelector');
			const modelText = document.getElementById('modelField');
			const oldVal = modelText.value;
			
			// clear the existing list:
			while (modelSel.firstChild) {
				modelSel.removeChild(modelSel.lastChild);
			}
			
			// load the list of models:
			(async () => {
				const result = await $opt._getModelsList(data);
				if (result._valid) {

					$opt.setInfo('info', "List of models retrieved successfully. Click on “Test” to validate the model.");

					// first add an empty item:
					const empty = document.createElement('OPTION');
					empty.setAttribute('value', '');
					modelSel.appendChild(empty);

					// add all found models:
					let found = false;
					result.list.forEach(model => {
						const opt = document.createElement('OPTION');
						opt.setAttribute('value', model.id);
						if (model.id == oldVal) {
							opt.setAttribute('selected', 'selected');
							found = true;
						}
						opt.textContent = model.id + ( model.loaded ? ' *' : '');
						modelSel.appendChild(opt);
					});

					// if not found, select the empty item:
					if (!found) {
						empty.setAttribute('selected', 'selected');
						modelText.value = ''; // also clear the text field
					}

					// hide the text field and instead make the popup visible:
					modelText.style.display = 'none';
					modelSel.style.display = 'initial';

				} else {
					$opt.setInfo('error', result._error);
				}
			})();
			
		} else {
			$opt.setInfo('error', "Error: " + data._error);
		}
	},
	
	onTestButtonClick: function(e) {
		console.info("$opt.onTestButtonClick()");

		const testBtn = document.getElementById('testButton');
		const saveBtn = document.getElementById('saveButton');
		
		const data = $opt._readFormData(false);
		if (data._valid) {

			// disable the test button for the run:
			testBtn.disabled = true;
			
			// check the connection by sending an empty request asynchronously:
			(async () => {
				const result = await $opt._checkConnection(data);

				if (result._valid) {
					$opt.setInfo('info', "Validation succeeded. Press “Save” button to save the settings.");

				} else { // not valid, show error
					$opt.setInfo('error', result._error);
				}
				saveBtn.disabled = !result._valid;
			})();

		} else {
			$opt.setInfo('error', data._error);
		}

		// enable the test button again:
		testBtn.disabled = false;

	},
	
	onSaveButtonClick: function(e) {
		console.info("$opt.onSaveButtonClick()");

		const data = $opt._readFormData(false);
		if (data._valid) {
			delete data['_valid']; // remove unneeded elements

			(async () => { // store settings synchronously:
				const result = await $opt._storeSettings(data);
				if (result._valid) {
					$opt.setInfo('info', "Settings saved successfully.");
				} else {
					$opt.setInfo('error', data._error);
				}
			})();

		} else {
			$opt.setInfo('error', data._error);
		}

	},

	onModelsListChange: function(e) {
		console.info("$opt.onModelsListChange()");

		if (this.value !== '') {
			const modelText = document.getElementById('modelField');
			modelText.value = this.value;
			modelText.style.display = 'initial';
			this.style.display = 'none';
		}
	},
	
	setInfo: function(type, message) {
		console.info("$opt.setInfo()", type, message);

		const kClasses = ['info', 'error']; // possible types
		
		const msgField = document.getElementById('errorMessage');

		// set the right classes:
		if (!msgField.classList.contains(type)) {
			kClasses.forEach(k => {
				msgField.classList.remove(k); // remove all
			});
			msgField.classList.add(type);
		}

		// set the text:
		msgField.textContent = message;
		
	},

	_readFormData: function(skipModel = false) {
		console.info("$opt._readFormData()");

		// return object:
		let r = {
			type: '',
			server: '',
			model: '',
			apiKey: '',
			_valid: false
		}

		try {
			/* Type: */
			var typeSelector = document.getElementById("typeSelector");
			r.type = typeSelector.options[typeSelector.selectedIndex].value;
	
			/* Server: */
			r.server = document.getElementById('serverField').value;
	
			/* API key: */
			r.apiKey = document.getElementById('apiKeyField').value;
	
			/* Model: */
			if (!skipModel) {
				r.model = document.getElementById("modelField").value;
			}
	
			// TODO: Check for validity!
			r._valid = true;
			// add error message to _error, if validation fails.

		} catch (err) {
			r._valid = false;
			r._error = "ERROR: " + err.message;
		} finally {
			return r;
		}
	},

	_getModelsList: async function(data) {
		console.info("$opt._getModelsList()");
		//console.log(data);

		// return object:
		let r = {
			list: [],
			_valid: false,
			_error: "Unknown error"
		}
		
		// get the end point for listing models:
		let ep = 'models';
		if (data.type == 'ollama') {
			ep = 'tags';
		}

		// compose the URL to fetch from:
		let url = data.server
			+ (data.server.substr(-1) !== '/' ? '/' : '' ) + ep;

		// fetch the list of models:
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
			}

			// load the response:
			const result = await response.json();
			//console.log(result);

			// clean the list:
			//if (data.type == 'ollama' && 

			if (result.object == 'list' && Array.isArray(result.data)) {

				result.data.forEach(it => {
					if (it.id && it.object && it.object == 'model') {

						r.list.push({
							id: it.id
							// TODO: other information here?
						});
					}
				})
				r._valid = (r.list.length > 0);
				r._error = ( r._valid ? '' : 'No results')
			} else {
				r._error = "Response not understood."
			}

		} catch (err) {
			r._error = "Error: " + err.response;
		}

		return r;
	},
	
	_checkConnection: async function(data) {
		console.info("$opt._checkConnection()");

		let r = {
			_valid: false,
			_error: 'Unknown error.'
		}

		// Inform the user about what's happening
		$opt.setInfo('info', "Testing connection and selected model. This can take a few seconds …");
		
		// set the end point for testing the model:
		let ep = 'chat/completions';
		if (data.type == 'ollama') {
			ep = 'generate';
		}

		// compose the URL to fetch from:
		let url = data.server
			+ (data.server.substr(-1) !== '/' ? '/' : '' ) + ep;
		//console.log(url);
		
		// request headers:
		let headers = {
			"Content-Type": "application/json",
		};
		if (data.apiKey) {
			headers.Authorization = 'Bearer ' + encodeURIComponent(data.apiKey);
		}
		//console.log("Headers:", headers);

		// request body:
		let body = {
			"model": data.model,
			"messages": [{"role": "user", "content": ""}],
			"max_tokens": 1,
			"stream": false
		}
		//console.log("Body:", body);

		// Create a timeout controller and set a 10-second timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 20000);
		
		try { // send the request:

			const response = await fetch(url, {
				method: 'POST',
				headers: headers,
				body: JSON.stringify(body),
        signal: controller.signal // connect the abort controller
			});

			clearTimeout(timeoutId); // response -> clear timeout

			if (response.status !== 200) { // network error?
				throw new Error(`Connection failed with status ${response.status} (${response.statusText})`);
			}

			// load the response:
			const result = await response.json();
			if (result.error) {
				throw new Error(result.error.message || result.error || "API returned an unexpected error.");
			}
			
			if (!result.choices || result.choices.length === 0) {
				throw new Error("Connection works, but model failed to return a valid chat response object.");
			}

			// all good!
			r._valid = true;
		
		} catch (err) {

			clearTimeout(timeoutId); // error thrown -> clear timeout
			
			if (err.name === "AbortError") {
				r._error = "Connection timed out. This can happen if the model takes longer than expected to be loaded up. Please select a differnt model, or try again in a few seconds.";
			} else {
				r._error = err.message;
			}
		}
		return r;
	},

	_storeSettings: async function(data) {
		console.info("$opt._storeSettings()");
		
		// result information
		let r = {
			_valid: false,
			_error: ''
		}
		
		try {

			await browser.storage.local.set({ 'check_fallacies': data });
			r._valid = true;

		} catch (err) {
			r._error = "Failed to save settings: " + err;
		}
		return r;
	},

	_retrieveSettings: async function () {
		console.info("$opt._retrieveSettings()");

		// return object:
		let r = {
			_valid: undefined,
			_error: '',
			data: {}
		}

		try {
			const result = await browser.storage.local.get('check_fallacies');

			if (result.check_fallacies) {
				r.data = result.check_fallacies;
				r._valid = true;
			}
		} catch (error) {
			r._error = "Failed to load settings: " + error;
			r._valid = false;
		}
		return r;
	}
}
$opt.init();