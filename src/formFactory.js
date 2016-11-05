;(function(window, document){

	/**
	 * Match chinese characters.
	 */
	var chi = /[\u0391-\uFFE5]/g;

	/**
	 * Default
	 * @namespace
	 * @private
	 */
	var Default = {

		template: "<label class='ff-label'>{label}</label>" + 
				  "<input class='ff-input ff-hint' type='{type}' name='{name}'>" + 
				  "<span class='ff-hint'>{hint}</span>",

		getInfo: function(input){
			return input.nextElementSibling;
		},

		onfail: function(event, form){
			alert('Failed');
		},

		onsuccess: function(event, form){
			alert('Successful');
			if(form){
				form.submit();
			}
		},

		condition: function(val){
			if(this.value.trim() !== val){
				return "Should be the same value as '" + this.name + "' field.";
			}
			return null;
		}
	};

	var ClassName = {
		HINT:    'ff-hint',
		FAILED:  'ff-failed',
		SUCCESS: 'ff-success',
		BUTTON:  'ff-btn'
	};

	/**
	 * @namespace
	 * @readonly
	 * @public
	 */
	RULES = {
		required: {
			test: /^.+$/, 
			warn: "This field can't be empty."
		},

		email: {
			test: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, 
			warn: "Please input a valid email address."
		},

		url: {
			test: /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
			warn: "Please input a valid url."
		},

		ip: {
			test: /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
			warn: "Please input a valid ip address."
		},

		date: {
			test: /^\d{4}-\d{1,2}-\d{1,2}$/,
			warn: "Please input a date takes the form yyyy-mm-dd."
		},

		numeric: {
			test: /^[0-9]+$/,
			warn: "Numeric only."
		},

		alpha: {
			test:  /^[a-z]+$/i,
			warn: "Alpha only."
		},

		alphaNumeric: {
			test: /^[a-z0-9]+$/i,
			warn: "Alpha numeric only."
		},

		lengthWithChinese: function(lower, upper){
			return {
				test: function(val){
					var regExp = new RegExp("^[a-z,A-Z,\\d]{" + lower + "," + upper + "}$");
					return regExp.test(val.replace(chi, 'nn'));
				},
				warn: 'Length should between ' + lower + ' and ' + upper + '.'
			};
		}
	}; 

	var $$ = function(elem){
		return document.createElement(elem);
	};

	/*
	 * Register an event handler to a specific event.
	 * @param {HTMLElement} elem Element the event handler binded with.
	 * @param {string} type Event type.
	 * @param {Function} handler The event handler function.
	 */
	function addHandler(elem, type, handler){
		if(elem.attachEvent){
			elem.attachEvent('on' + type, handler);
		}
		else if(elem.addEventListener){
			elem.addEventListener(type, handler, false);
		}
		else{
			elem['on' + type] = handler;
		}
	}

	/*
	 * FormFactory
	 * @constructor
	 * @param {HTMLFormElement} base The form element to render the inputs. 
	 */
	function FormFactory(base){
		if(!base){
			console.warn('FormFactory: An HTMLElement should be provided.');
			this._base = null;
			return this;
		}

		base.innerHTML = '';
		this._base = base; 

		this._isInit = false;

		this._html = null;
		this._schema = null;
		this._getInfo = null;
		this._onfail = null;
		this._onsuccess = null; 
		this._dependency = null;
	}

	/**
	 * @typedef Template
	 * @type {Object}
	 * @property {string} template HTML template for form fields.
	 * @property {Function} getInfo Function return the information part of the template given the input element.
	 */

	/*
	 * Create form fields, register event handlers and validation rules.
	 * @public
	 * @param {Object} schema User customized schema for form creation.
	 * @param {Template} template HTML template for form fields.
	 */
	FormFactory.prototype.config = function(schema, template){
		if(this._base){

			if(!schema){
				console.warn('FormFactory: No schema provided.');
				return this;
			}

			if(template && template.template && !template.getInfo){
				console.warn('FormFactory: ' + 
					'A function returning the html element ' + 
					'showing the information should be provided together with your html template!');
				return this;
			}
			
			this._schema = schema;
			this._html = (template && template.template) || Default.template;
			this._findInfo = (template && template.getInfo) || Default.getInfo;
			this._onfail = Default.onfail;
			this._onsuccess = Default.onsuccess;
			this._dependency = {};

			this._render();

			//Register event handlers.
			addHandler(this._base, 'focusin', this._handlerWrapper(this._focusHandler));
			addHandler(this._base, 'focusout', this._handlerWrapper(this._focusHandler));
			addHandler(this._base, 'click', this._handlerWrapper(this._clickHandler));

			this._isInit = true;
		}

		return this;
	};

	/**
	 * Register callback functions when button is clicked.
	 * @param {Function} onfail
	 * @param {Function} onsuccess
	 */
	FormFactory.prototype.callback = function(onfail, onsuccess){
		if(this._isInit){
			this._onfail = onfail || Default.onfail;
			this._onsuccess = onsuccess || Default.onsuccess;
		}

		return this;
	};

	/**
	 * @typedef Dependency
	 * @type {Object}
	 * @property {string} relier
	 * @property {string} depended
	 * @property {Function} condition
	 */

	/**
	 * Add dependencies between fields.
	 * @param {Dependency|[Dependency]} dep
	 */
	FormFactory.prototype.dependency = function(deps){
		if(this._isInit){

			if(!(deps instanceof Array)){
				return this.dependency([deps]);
			}

			for(var i = 0; i < deps.length; i++){
				var dep = deps[i];
				var relier = dep.relier;

				if(!dep.depended){
					continue;
				}

				var condFn = dep.condition ? dep.condition : Default.condition;

				if(this._dependency[relier]){
					this._dependency[relier][dep.depended] = condFn;
				}else{
					var cond = {};
					cond[dep.depended] = condFn;
					this._dependency[relier] = cond;
				}
			}
		}

		return this;
	};

	/*
	 * Render form field.
	 * @private
	 */
	FormFactory.prototype._render = function(){
		var frag = document.createDocumentFragment();
		for(var name in schema){
			var input = schema[name];
			var label = input.label || '';
			var type = input.show ? 'text' : 'password';
			var hint = input.hint || '';

			var newField = $$('div');
			var html = this._html.replace(/\{label\}/, label)
								 .replace(/\{type\}/, type)
								 .replace(/\{name\}/, name)
								 .replace(/\{hint\}/, hint);
			newField.innerHTML = html;
			frag.appendChild(newField);
		}
		var button = $$('input');
		button.type = 'submit';
		button.classList.add(ClassName.BUTTON);

		frag.appendChild(button);
		this._base.appendChild(frag);
	};

	FormFactory.prototype._handlerWrapper = function(handler){
		var _this = this;
		return function(e){
			handler.call(_this, e);
		};
	};

	/**
	 * @callback
	 */
	FormFactory.prototype._clickHandler = function(e){
		e.preventDefault();
		var target = e.target;
		var type = target.type;
		if(type === 'submit' || type === 'button'){
			var inputs = this._base.elements;
			var isValid = true;
			for(var i = 0; i < inputs.length; i++){
				if(inputs[i] !== target){
					var result = this._execValidation(inputs[i]);
					if(!result){
						isValid = false;
					}
				}
			}
			if(isValid){
				this._onsuccess(e, this._base);
			}	
			else{
				this._onfail(e, this._base);
			}
		}
	};

	/**
	 * @callback
	 */
	FormFactory.prototype._focusHandler = function(e){
		var target = e.target;

		if(target.type === 'submit' || target.type === 'button'){
			return;
		}

		if(e.type === 'focusin'){
			//Show hint when focusin happens.
			var info = this._schema[target.name].hint;
			var classname = ClassName.HINT;
			this._changeState(target, info, classname);
		}
		else if(e.type === 'focusout'){
			//Show validation result when focusout happens.
			//Validate according to rules.
			this._execValidation(target);
		}
	};

	FormFactory.prototype._execValidation = function(target){
		var value = target.value.trim();
		var name = target.name;
		//Validate according to rules.
		var result = this._validator(this._schema[name].rules, value);
		var r = false;
		var info = null;
		var classname = null;
		if(!result){
			//Validate according to dependencies
			result = this._validateDepend(name, value);
			if(!result){
				info = this._schema[name].valid;
				classname = ClassName.SUCCESS;
				r = true;
			}else{
				info = result;
				classname = ClassName.FAILED;
			}
		}else{
			info = result;
			classname = ClassName.FAILED;
		}
		this._changeState(target, info, classname);
		return r;
	};

	FormFactory.prototype._validateDepend = function(name, value){
		var result = null;
		if(this._dependency[name]){
			var dep = this._dependency[name];
			for(var d in dep){
				var dependedInput = this._base.elements[d];
				result = dep[d].call(dependedInput, value);
				if(result){
					return result;
				}
			}
		}

		return result;
	};

	FormFactory.prototype._validator = function(rules, value){
		var result = null;
		for(var rule in rules){
			var test = rules[rule].test;
			var warn = rules[rule].warn;
			if(test instanceof RegExp){
				if(!test.test(value)){
					return warn;
				}
			}
			else if(test instanceof Function){
				if(!test(value)){
					return warn;
				}
			}
		}
	};

	/*
	 * Change the state of a field according to the validation result.
	 * @private
	 * @param {HTMLInputElment} target Target input element.
	 * @param {string} info Information to show.
	 * @param {string} classname Class name to be assigned.
	 */
	FormFactory.prototype._changeState = function(target, info, classname){
		var infoPart = this._findInfo(target);

		infoPart.classList.remove(ClassName.HINT);
		infoPart.classList.remove(ClassName.FAILED);
		infoPart.classList.remove(ClassName.SUCCESS);

		infoPart.innerHTML = info;
		infoPart.classList.add(classname);
		target.classList.add(classname);
	};

	//expose formFactory
	if(typeof window.formFactory === 'undefined'){
		window.formFactory = function(base){
			return new FormFactory(base);
		};
		window.formFactory.RULES = RULES;
	}
})(window, document);