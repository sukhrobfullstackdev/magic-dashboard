import { autocompleteData, type NestedObject } from './template-view/autocomplete';
import { convertStringWithTemplateVariables } from './utils';

const TESTS = [
  { input: '', output: '' },
  { input: '<div>{{</div>', output: '<div>{{</div>' },
  { input: '<div>{{invaild_template_var}}</div>', output: '<div>{{invaild_template_var}}</div>' },
  { input: '<div>{magic_link}</div>', output: '<div>{magic_link}</div>' },
  { input: '<div>{{magic_link}}</div>', output: `<div>${autocompleteData.magic_link}</div>` },
  { input: '{{user.email}}', output: (autocompleteData.user as NestedObject).email },
  { input: '{{template.use_case}}', output: (autocompleteData.template as NestedObject).use_case },
  { input: '{{otp}}', output: `${autocompleteData.otp}` },
  {
    input: `
<!doctype html>
<html>
<head>
<title>This is the title of the webpage!</title>
</head>
<body>
<p>
This is an example paragraph. Anything in the <strong>body</strong> tag
will appear on the page, just like this <strong>p</strong> tag and its
contents.
</p>
<a href="{{magic_link}}">click me</a>
email: {{user.email}}
login browser: {{login.device.browser}}
code: {{otp}}
</body>
</html>`,
    output: `
<!doctype html>
<html>
<head>
<title>This is the title of the webpage!</title>
</head>
<body>
<p>
This is an example paragraph. Anything in the <strong>body</strong> tag
will appear on the page, just like this <strong>p</strong> tag and its
contents.
</p>
<a href="${autocompleteData.magic_link}">click me</a>
email: ${(autocompleteData.user as NestedObject).email}
login browser: ${((autocompleteData.login as NestedObject).device as NestedObject).browser}
code: ${autocompleteData.otp}
</body>
</html>`,
  },
];

test('convertStringWithTemplateVariables', () => {
  TESTS.forEach((test) => {
    expect(convertStringWithTemplateVariables(test.input)).toEqual(test.output);
  });
});
