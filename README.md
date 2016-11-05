# formFactory
A configurable form factory with form validation
## Features
- Automatically generates form fields according to your configuration without writing in HTML files.
- Validate form fields according to customized rules or rules provided by `formFactory`.
- No dependencies on any other libraries.
- Customized messages supplied.
- Customized html template supplied.
- Dependencies between fields supplied.
- Chainable invoking of configuration APIs.

## Installation
Grab `formFactory` from /dist directory on github.

```html
<script type="text/javascript" src="formFactory.min.js"></script>
```

## Usage
### Instantiation
Pass an HTMLFormElement into `formFactory` to instantiate an instance.  
HTML  
```html
<form id="my-form" action=""></form>
```
javascript  
```javascript
var myForm = document.querySelector('#my-form');
/**
 * Pass myForm into formFactory
 */
var ff = formFactory(myForm);
```
### Generation
Pass a `schema` to a `formFactory` instance.   
At the same time, a customized html template can be passed in.  
If you do not provide your html template, default template will be used.  
```javascript
var schema;   //some value
var template; //some value
ff.config(schema);
//or
ff.config(schema, template);
```
#### Schema
The `schema` is a javascript object with multiple properties.   
Each of the property name will be used as the `name` attribute of the corresponding form field.  
The value of a property of `schema` is a series of configuration items for the corrsponding field.  
For example, the following is a `schema` for a two-field form:  
```javascript
var schema = {
    name: {
        label: 'name',                   
        show: true,                      
        hint: 'Please input your name.', 
        valid: 'Name is valid.',         
        rules: {
            required: formFactory.RULES.required,
            lengthWithChinese: formFactory.RULES.lengthWithChinese(4, 16)
        }
    },
    password: {
        label: 'password',
        show: false,
        hint: 'Please input your password.',
        valid: 'Password is valid.',
        rules: {
            customizedRegRule: {
                test: /^[a-z,A-Z,\d]+$/,
                warn: 'Password contains only digits and English letters.'
            }
            customizedFuncRule: {
                test: function(value){return value === 'ok'},
                warn: 'Customized function rule failed.'
            }
        }
    }
};
```
As you can see, configuration items for a field include: 

|Configuration item|Description|
|---|---|
|label|A label displayed for this field|
|show|Whether the content of this field should be seen|
|hint|Hint message for this field|
|valid|Message displayed when this field is valid|
|rules|A series of rules for the validation of this field|
`rules` is also a javascript object, each of its property present a validation rule.  
The value of the properties is an object width two properties: `test` and `warn`.  
`test` can be a regular expression to match or a function returning boolean value.  
`warn` is a string to be shown when this rule is not satisfied.  
Some rules are provided by `formFactory`, you can use them directly:`formFactory.RULES.*`.  

|Rule|Description|
|---|---|
|required|This field is required(can not be empty)|
|email|This field should be in the format of an email address|
|url|This field should be in the format of a url|
|ip|This field should be in the format of a dot-seperated IP address|
|date|This field should be in the format of a date taking yyyy-mm-dd|
|numeric|Content of this field should only be digits|
|alpha|Content of this field should only be English letters|
|alphaNumeric|Content of this field should only be English letters or digits|
|lengthWithChinese(lower, upper)|Length of this field should be in the range [lower, upper] with `lower` and `upper` provided by user|

#### template
`template` is a javascript object with two properties:`template` and `getInfo`.  
`template` is a template string.  It provides the html template for a field.
`getInfo` is a function taking an HTMLInputElement object as an input, and returning an HTMLElement object showing the message for this field. This function is provided for formFactory to find the element to display messages, since user provides the template.  
For example
```javascript
var template = {
	template: "<h1 class='ff-label'>{label}</h1>" + 
				  "<input class='ff-input' type='{type}' name='{name}'>" + 
				  "<span class='ff-hint'>{hint}</span>",

	getInfo: function(input){
		return input.nextElementSibling;
	}
};
```
`Notice`: In your template, contents wrapped by curly braces must be provided, they inform `formFactory` where to fill the configuration items.  

If you want to use the stylesheet `formFactory` provides, remember to use the `formFactory.min.css` in the /dist directory and attach: 
- a class name `ff-label` to the element displaying the `label` in `schema` 
- a class name `ff-input` to the input element
- a class name `ff-hint` to the element displaying the messages  

just like template shown above.

#### Class interface

The following class names are used for parts of each field, users can use them in a .css file to design customized stylesheet:  

|Class name|Description|
|---|---|
|ff-hint|class name attached to the element displaying the hint and the input element when hint is shown|
|ff-success|class name attached to the element displaying the success message and the input element when the field is valid|
|ff-failed|class name attached to the element displaying the error message and the input element when the field is invalid|
|ff-btn|class name attached to the submit button|

### Dependency
In some circumstances, a field's value may depend on other fields' value, users can configure `formFactory` to validate a field based on these dependency relationships. An array of dependency object can be pass to `formFactory`. A dependency object has at least two properties: `relier` and `depended`, where `depended` is depended by `relier`. Both of them are strings and are property names of the `schema` object.  
For example,  
```javascript
{
    relier: 'password',
	depended: 'name'
}
```
This object presents a dependency relationship between `password` field and `name` field that `password` field depends on `name` field.  
Also, the third property of a dependency object is `condition`, which is a function whose `this` object is the depended field which is an HTMLInputElement object.  
`condition` function will be assigned the trimed value of `relier` and returns a warning message when condition is not satisfied or null when condition is satisfied.  
For example, 
```javascript
{
    relier: 'password',
	depended: 'name',
	condition: function(value){
	   if(this.value.trim() !== val){
	       return "Should be the same value as '" + this.name + "' field.";
	   }
	   return null;
	}
}
```
If `condition` is not provided, `formFactory` will use its default condition function which is exactly the one showing above.  
To add dependency relationships to `formFactory`, use the following API: 
```javascript
ff.dependency([
				{
					relier: 'password',
					depended: 'name'
				}]);
```
### Callback
A submit button will be placed after all of the input fields. When the button is clicked, all fields will be validated and one of two callback functions will be invoked: `onfail` and `onsuccess` depending on the validation results. If users don't provide these two functions, `formFactory` will alse invoke its default ones.  

Both of above mentioned callback functions will receive two parameters, the first one is the event object when the button's click event is triggered, the second one is the HTMLFormElement passed in when users instantiate the `formFactory` object.  

If you want to submit the form when submit button clicked, you have to invoke the HTMLFormElement's .submit() method in the callback function to do that, or the form won't be submitted. Or you can use Ajax to submit the form, that's the reason `formFactory` passes the HTMLFormElement into the callback function: to make it easy for users to provide customized actions.  

Notice that the default `onsuccess` callback function provided will submit the form since it's implemented as follows:
```javascript
function(event, form){
	alert('Successful');
	if(form){
		form.submit();
	}
}
```

### Chainable
APIs above are chainable:
```javascript
var f1 = formFactory(document.querySelector('.form-1'))
			.config(schema, template)
			.dependency([
				{
					relier: 'password',
					depended: 'name'
				}
			])
			.callback(
				function(){alert('outer onfail provided');}, 
				function(){alert('outer onsuccess provided');}
			);
```

`Notice` There is a demo in `index.js` and `index.html` showing how to use `formFactory`.