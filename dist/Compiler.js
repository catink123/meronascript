import { parseArgString } from "./Argument";
const statementSplitRegExp = / /;
// const lineSplitRegExp = /;[\n ]+/mgs;
const lineSplitRegExp = /(?<!\\);[\s\t]+/mgs;
const lineTrimRegExp = /^.+?(?=;)/mgs;
const lineFilterEmptyRegExp = /^[\s\t]*\/\//;
const lineSplitInlineRegExp = /(?<![\\"]);[\s\t]*/g;
const lineTrimUnnecessaryRegExp = /((?<!\\);|^[\s\t]*)/g;
export function precompileScript(scriptText) {
    let precompiledScript;
    // Split the lines by the line split RegEx and clear the ';' from the last line, because of limitations of the RegEx
    // let scriptLines = 
    // 	scriptText
    // 		.split(lineSplitRegExp)
    // 		.map((line, index, arr) => index == arr.length - 1 ? line.match(lineTrimRegExp)[0] : line);
    // let scriptLines = 
    // 	scriptText
    // 		.split(/\n/)
    // 		.filter(line => line.length > 0 && line.match(lineFilterEmptyRegExp) === null)
    // 		.map(line => line.replaceAll(lineTrimUnnecessaryRegExp, ''))
    let scriptLines = scriptText
        // Split by line breaks
        .split(/\n/)
        // Remove comments and empty lines
        .filter(line => line.length > 0 && line.match(lineFilterEmptyRegExp) === null)
        // Split lines with multiple statements in one line (separated by a semicolon)
        .map(line => line.split(lineSplitInlineRegExp))
        // Convert "Arrays in Arrays" to a single Array
        .flat(2)
        // Remove empty strings created by the previous line split
        .filter(line => line.length > 0)
        // Remove remaining semicolons and spacing characters in the beginning of every line
        .map(line => line.replaceAll(lineTrimUnnecessaryRegExp, ''));
    let scriptStatements = scriptLines.map(val => {
        let parts = val.split(statementSplitRegExp);
        return [parts.shift(), parts.join(' ')];
    });
    precompiledScript = scriptStatements.map(statement => {
        const commandName = statement[0];
        const argString = statement[1];
        let args = argString.length > 0 ? parseArgString(argString) : [];
        // Compile command groups, if there are any
        // args = args.map(arg => arg.type === MSArgumentType.CommandGroup ? {...arg, value: precompileScript(arg.value)} : arg);
        return {
            command: commandName,
            args
        };
    });
    return precompiledScript;
}
