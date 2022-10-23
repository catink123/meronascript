export var MSArgumentType;
(function (MSArgumentType) {
    MSArgumentType[MSArgumentType["Normal"] = 0] = "Normal";
    MSArgumentType[MSArgumentType["VariableReference"] = 1] = "VariableReference";
    MSArgumentType[MSArgumentType["JavaScript"] = 2] = "JavaScript";
})(MSArgumentType || (MSArgumentType = {}));
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
    string: (s) => s.match(/(?<=').+(?=')/)[0],
    js: (s) => s.match(/(?<=\|).+(?=\|)/)[0],
    float: (s) => parseFloat(s),
    integer: (s) => parseInt(s),
    variable: (s) => s
};
const argumentTypeRelationMap = new Map([
    ['string', MSArgumentType.Normal],
    ['js', MSArgumentType.JavaScript],
    ['float', MSArgumentType.Normal],
    ['integer', MSArgumentType.Normal],
    ['variable', MSArgumentType.VariableReference]
]);
const convertToArgObject = (argString, type) => ({ type: argumentTypeRelationMap.get(type), value: converters[type](argString) });
export function parseArgString(argString) {
    let splitArgString = argString.match(argumentRegExp);
    let parsedArgs = splitArgString
        .map(argString => {
        let type;
        if (qualifiers.string.test(argString))
            type = 'string';
        else if (qualifiers.js.test(argString))
            type = 'js';
        else if (qualifiers.float.test(argString))
            type = 'float';
        else if (qualifiers.integer.test(argString))
            type = 'integer';
        else if (qualifiers.variable.test(argString))
            type = 'variable';
        return convertToArgObject(argString, type);
    });
    return parsedArgs;
}
// export function parseArgString(argString: string): MSArgument[] {
//   let args: MSArgument[] = [];
//   let currentWorkingString = '';
//   let isCurArgString = false;
//   let isCurArgJS = false;
//   for (const [index, char] of Object.entries(argString)) {
//     if (char === "|") {
//       if (!isCurArgString) {
//         if (isCurArgJS) {
//           isCurArgJS = false;
//           args.push({type: MSArgumentType.JavaScript, value: currentWorkingString});
//           currentWorkingString = '';
//         } else isCurArgJS = true;
//       } else 
//         currentWorkingString += char;
// 
//       continue;
//     }
//     if (char === "'") {
//       if (isCurArgJS) {
//         currentWorkingString += char;
//         continue;
//       }
//       if (!isCurArgString) {
//         isCurArgString = true;
//         continue;
//       } else {
//         isCurArgString = false;
//         // args.push({type: MSArgumentType.Normal, value: currentWorkingString});
//         // currentWorkingString = '';
//       }
//     }
//     if ((char === ' ' && !isCurArgString && !isCurArgJS) || parseInt(index) === argString.length) 
//       args.push(parseValue(currentWorkingString));
//     else currentWorkingString += char;
//   }
//   // if (currentWorkingString.length > 0) args.push(isCurArgString ? currentWorkingString : parseValue(currentWorkingString));
//   return args;
// }
// 
// function parseValue(value: string): MSArgument {
//   let returnValue: any;
//   let argType = MSArgumentType.Normal;
//   if (value.match(/[a-z]/i)) { // Is some kind of text
//     if (value.match(/^true$|^false$/)) returnValue = value === 'true' ? true : false // Is boolean, convert to boolean
//     else { // Is a plain string, that means it is a variable name, as strings are parsed in the main parseArgString function
//       returnValue = value;
//       argType = MSArgumentType.VariableReference;
//     }
//   } else if (value.match(/[0-9]/)) { // Is a number or a float
//     if (value.includes('.')) returnValue = parseFloat(value)
//     else returnValue = parseInt(value);
//   }
// 
//   return {
//     type: argType,
//     value: returnValue
//   }
// }
