export enum MSArgumentType {
  Normal,
  VariableReference,
  JavaScript,
  // CommandGroup
}

export interface MSArgument {
  type: MSArgumentType,
  value: any
}

const argumentRegExp = /('.+?'|".+?"|\|.+?\||\(.+?\)|\[.+?\]|\{.+?\}|\d+\.\d+|\d+|\w+)/g;
// Exact order of checking
const qualifiers = {
	string: /^('.*'|".*")$/,
  // commandGroup: /^(.*)$/,
  array: /^\[.*\]$/,
	js: /^\|.*\|$/,
	float: /^\d+.\d+$/,
	integer: /^\d+$/,
	variable: /^[A-Za-z]\w+$/
};
const converters = {
	string: (s: string) => new String(s.match(/(?<='|").+(?='|")/)[0]),
  // commandGroup: (s: string) => s.match(/(?<=\().+(?=\})/)[0],
  array: (s: string) => parseArgStringArray(s.match(/(?<=\[).+(?=\])/)[0].split(/, */)).map((arg: MSArgument) => arg.value),
	js: (s: string) => s.match(/(?<=\|).+(?=\|)/)[0],
	float: (s: string) => parseFloat(s),
	integer: (s: string) => parseInt(s),
	variable: (s: string) => s
};

// 'commandGroup' is removed
export type MSArgumentRawType = 'string' | 'array' | 'js' | 'float' | 'integer' | 'variable';

const argumentTypeRelationMap = new Map<MSArgumentRawType, MSArgumentType>([
  ['string', MSArgumentType.Normal],
  // ['commandGroup', MSArgumentType.CommandGroup],
  ['array', MSArgumentType.Normal],
  ['js', MSArgumentType.JavaScript],
  ['float', MSArgumentType.Normal],
  ['integer', MSArgumentType.Normal],
  ['variable', MSArgumentType.VariableReference]
]);

const convertToArgObject = (argString: string, type: MSArgumentRawType) => ({type: argumentTypeRelationMap.get(type), value: converters[type](argString)});

const parseArgStringArray =
  (argStringArray: string[]) => 
    argStringArray.map(argString => {
      let type: MSArgumentRawType;
      if (qualifiers.string.test(argString)) type = 'string';
      // else if (qualifiers.commandGroup.test(argString)) type = 'commandGroup';
      else if (qualifiers.array.test(argString)) type = 'array';
      else if (qualifiers.js.test(argString)) type = 'js';
      else if (qualifiers.float.test(argString)) type = 'float';
      else if (qualifiers.integer.test(argString)) type = 'integer';
      else if (qualifiers.variable.test(argString)) type = 'variable';
      return convertToArgObject(argString, type);
    });

export function parseArgString(argString: string): MSArgument[] {
  let splitArgString = argString.match(argumentRegExp);
  let parsedArgs = parseArgStringArray(splitArgString);
	return parsedArgs;
}
