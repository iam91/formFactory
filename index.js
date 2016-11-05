var schema = {
	name: {
		label: 'name',
		show: true,
		hint: '必填，长度为4-16个字符',
		valid: '验证成功',
		rules: {
			required: formFactory.RULES.required,
			lengthWithChinese: formFactory.RULES.lengthWithChinese(4, 16)
		}
	},
	password: {
		label: 'password',
		show: false,
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
			},
			temp: formFactory.RULES.ip
		}
	},
	email: {
		label: 'email',
		show: true,
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
var template = {
	template: "<h1 class='ff-label'>{label}</h1>" + 
				  "<input class='ff-input ff-hint' type='{type}' name='{name}'>" + 
				  "<span class='ff-hint'>{hint}</span>",

	getInfo: function(input){
		return input.nextElementSibling;
	}
				};

var ff = formFactory(document.querySelector('.temp'))
			.config(schema, template)
			.dependency([
				{
					relier: 'password',
					depended: 'name'
				}]).callback(
					function(){alert('outer onfail provided');}, 
					function(){alert('outer onsuccess provided');});

var t = formFactory(document.querySelector('.tt')).config(schema);

console.log(document.querySelector('.tt'));
