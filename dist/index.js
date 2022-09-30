import { MSArgumentType, parseArgString } from "./Argument";
import { commandsFromObject } from "./Command";
export const INTERNAL_COMMANDS = commandsFromObject({
    let(args, vars, se) {
        vars.set(args[0], args[1]);
        se.emit('stdout', args);
        se.emit('stdout', vars);
    },
    println(args, _, se) {
        se.emit('stdout', args[0]);
    }
});
export class MSEngine {
    constructor(scriptText, commands, initialVariables, _options) {
        this.listeners = [];
        this.variables = new Map(Object.entries(initialVariables !== null && initialVariables !== void 0 ? initialVariables : {}));
        this.registeredCommands = new Map([...commands, ...INTERNAL_COMMANDS]);
        this.precompiledScript = this.precompileScript(scriptText);
    }
    precompileScript(scriptText) {
        let precompiledScript;
        let scriptLines = scriptText.replaceAll(/[\r\n]/g, '').split(';').filter(val => val !== '');
        let scriptStatements = scriptLines.map(val => {
            let parts = val.split(' ');
            return [parts.shift(), parts.join(' ')];
        });
        precompiledScript = scriptStatements.map(statement => {
            const commandName = statement[0];
            let argString = statement[1];
            const args = parseArgString(argString);
            return {
                command: commandName,
                args
            };
        });
        return precompiledScript;
    }
    run() {
        this.runPrecompiledScript(this.precompiledScript);
    }
    runPrecompiledScript(precompiledScript) {
        for (const statement of precompiledScript) {
            let commandToExecute = this.registeredCommands.get(statement.command);
            if (!commandToExecute)
                throw new Error("No such command: " + statement.command);
            let formattedArguments = statement.args.map(arg => {
                if (arg.type === MSArgumentType.Normal)
                    return arg.value;
                if (arg.type === MSArgumentType.VariableReference) {
                    let theVar = this.variables.get(arg.value);
                    if (!theVar)
                        throw new Error("No variable with name: " + arg.value);
                    return theVar;
                }
                if (arg.type === MSArgumentType.JavaScript) {
                    return eval(arg.value);
                }
            });
            commandToExecute(formattedArguments, this.variables, this);
        }
    }
    compileAndRun(scriptText) {
        let precompiledScript = this.precompileScript(scriptText);
        this.runPrecompiledScript(precompiledScript);
    }
    on(type, callback) {
        this.listeners.push({
            type, callback
        });
    }
    removeListener(callback) {
        this.listeners.filter(val => val.callback === callback).forEach(listener => this.listeners.splice(this.listeners.findIndex(listener)));
    }
    emit(type, detail) {
        this.listeners.filter(val => val.type === type).forEach(listener => listener.callback({ detail }));
    }
}
