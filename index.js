var schema = {
	name: {
		label: 'name',
		show: false,
		hint: '必填，长度为4-16个字符',
		valid: '验证成功',
		rules: {
			required: formFactory.RULES.required,
			lengthWithChinese: formFactory.RULES.lengthWithChinese(4, 16)
		}
	},
	password: {
		label: 'password',
		show: true,
		hint: '请输入密码',
		valid: '验证成功',
		rules: {
			nonempty: {
				test: /^.+$/, 
				warn: '密码不能为空'
			},
			usable: {
				test: /^[a-z,A-Z,\d]+$/, 
				warn: '密码只能为数字或字母'
			}
		}
	},
	email: {
		label: 'email',
		show: false,
		hint: '请输入邮箱',
		valid: '验证成功',
		rules: {
			nonempty: {
				test: /^.+$/, 
				warn: '邮箱不能为空'
			},
			email: formFactory.RULES.email
		}
	}
};
var t = schema.name.rules;
console.log(t);
var template = {
	template: "<h1 class='ff-label'>{label}</h1>" + 
				  "<input class='ff-input ff-hint' type='{type}' name='{name}'>" + 
				  "<span class='ff-hint tt'>{hint}</span>",

	getInfo: function(input){
		return input.nextElementSibling;
	}
				};
var ff = formFactory(document.querySelector('.ff'))
			.config(schema, template)
			.dependency([
				{
					relier: 'email',
					depended: 'password'
				}, 
				{
					relier: 'password',
					depended: 'name'
				}]).callback(function(){alert('outer onfail provided');});

var dd;
for(var i in dd){
	console.log(d);
}
console.log(dd);
