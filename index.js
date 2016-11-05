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
			}
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
	template: "<h1>{label}</h1>" + 
			  "<input type='{type}' name='{name}'>" + 
			  "<span >{hint}</span>",
	getInfo: function(input){
		return input.nextElementSibling;
	}
};

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

var f2 = formFactory(document.querySelector('.form-2')).config(schema);
