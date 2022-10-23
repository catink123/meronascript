export enum MSArgumentType {
  Normal,
  VariableReference,
  JavaScript
}

export interface MSArgument {
  type: MSArgumentType,
  value: any
}

const argumentRegExp = /('.+?'|\|.+?\||\d+\.\d+|\d+|\w+)/g;

// Exact order of checking
const stringQualifier = /^'.*'$/;
const jsQualifier = /^\|.+\|$/;
const floatQualifier = /^\d+.\d+$/;
const integerQualifier = /^\d+$/;
const variableQualifier = /^[A-Za-z]\w+$/;
const qualifiers = {
	string: new RegExp(stringQualifier),
	js: new RegExp(jsQualifier),
	float: new RegExp(floatQualifier),
	integer: new RegExp(integerQualifier),
	variable: new RegExp(variableQualifier)
};
const converters = {
	string: (s: string) => s.match(/(?<=').+(?=')/)[0],
	js: (s: string) => s.match(/(?<=\|).+(?=\|)/)[0],
	float: (s: string) => parseFloat(s),
	integer: (s: string) => parseInt(s),
	variable: (s: string) => s
};

export type MSArgumentRawType = 'string' | 'js' | 'float' | 'integer' | 'variable';

const argumentTypeRelationMap = new Map<MSArgumentRawType, MSArgumentType>([
  ['string', MSArgumentType.Normal],
  ['js', MSArgumentType.JavaScript],
  ['float', MSArgumentType.Normal],
  ['integer', MSArgumentType.Normal],
  ['variable', MSArgumentType.VariableReference]
]);

const convertToArgObject = (argString: string, type: MSArgumentRawType) => ({type: argumentTypeRelationMap.get(type), value: converters[type](argString)});

export function parseArgString(argString: string): MSArgument[] {
  let splitArgString = argString.match(argumentRegExp);
  
  let parsedArgs =
    splitArgString
      .map(argString => {
        let type: MSArgumentRawType;
        if (qualifiers.string.test(argString)) type = 'string';
        else if (qualifiers.js.test(argString)) type = 'js';
        else if (qualifiers.float.test(argString)) type = 'float';
        else if (qualifiers.integer.test(argString)) type = 'integer';
        else if (qualifiers.variable.test(argString)) type = 'variable';
        return convertToArgObject(argString, type);
      });
	return parsedArgs;
}
