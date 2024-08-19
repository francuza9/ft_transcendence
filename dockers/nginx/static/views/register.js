import {replaceHTML} from '/static/src/js/utils.js';
import {observeRegisterForm} from '/static/src/js/register.js';

export async function Register() {
	replaceHTML('/static/src/html/register.html', false); 
	observeRegisterForm();
}
