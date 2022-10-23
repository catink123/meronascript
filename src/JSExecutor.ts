import {MSVariables} from ".";

const varsToJS = (vars: MSVariables) => {
	if (vars.size === 0) return ''; 
	let returnString = 'let ';
	
	vars.forEach((val, name) => {
		returnString += `${name} = ${JSON.stringify(val)}, `;
	});
	returnString = returnString.replace(/, $/, '; ');
	return returnString;
}

export function executeJS(variables: MSVariables, js: string) {
	return Function(`"use strict"; ${varsToJS(variables)}return ${js};`)();
}
