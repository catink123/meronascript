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
