export var MSArgumentType;
(function (MSArgumentType) {
    MSArgumentType[MSArgumentType["Normal"] = 0] = "Normal";
    MSArgumentType[MSArgumentType["VariableReference"] = 1] = "VariableReference";
    MSArgumentType[MSArgumentType["JavaScript"] = 2] = "JavaScript";
    // CommandGroup
})(MSArgumentType || (MSArgumentType = {}));
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
    string: (s) => new String(s.match(/(?<='|").+(?='|")/)[0]),
    // commandGroup: (s: string) => s.match(/(?<=\().+(?=\})/)[0],
    array: (s) => parseArgStringArray(s.match(/(?<=\[).+(?=\])/)[0].split(/, */)).map((arg) => arg.value),
    js: (s) => s.match(/(?<=\|).+(?=\|)/)[0],
    float: (s) => parseFloat(s),
    integer: (s) => parseInt(s),
    variable: (s) => s
};
const argumentTypeRelationMap = new Map([
    ['string', MSArgumentType.Normal],
    // ['commandGroup', MSArgumentType.CommandGroup],
    ['array', MSArgumentType.Normal],
    ['js', MSArgumentType.JavaScript],
    ['float', MSArgumentType.Normal],
    ['integer', MSArgumentType.Normal],
    ['variable', MSArgumentType.VariableReference]
]);
const convertToArgObject = (argString, type) => ({ type: argumentTypeRelationMap.get(type), value: converters[type](argString) });
const parseArgStringArray = (argStringArray) => argStringArray.map(argString => {
    let type;
    if (qualifiers.string.test(argString))
        type = 'string';
    // else if (qualifiers.commandGroup.test(argString)) type = 'commandGroup';
    else if (qualifiers.array.test(argString))
        type = 'array';
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
export function parseArgString(argString) {
    let splitArgString = argString.match(argumentRegExp);
    let parsedArgs = parseArgStringArray(splitArgString);
    return parsedArgs;
}
