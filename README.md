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
Pass a schema to a `formFactory` instance.  
At the same time, a customized html template can be passed in.
If you do not provide your html template, default template will be used.
