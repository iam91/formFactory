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
var myForm = document.querySelector('.my-form');
/**
 * Pass myForm into formFactory
 */
var ff = formFactory(myForm);
```
### Generation
Pass a `schema` to a `formFactory` instance.  
At the same time, a customized html template can be passed in.
If you do not provide your html template, default template will be used.

The `schema` is a javascript object with multiple properties. Each of the property name will be used as the `name` attribute of the corresponding form field.  
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
                warn: 'Password contains only digitals and English letters.'
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
`warn` is a string to be showed when this rule is not satisfied.
