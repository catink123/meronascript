import {MSArgumentType, parseArgString, MSArgument} from "./Argument";
import {commandsFromObject, MSCommand, MSCommands} from "./Command";
import {MSEventType, MSEventListenerCallback, MSEventListener} from "./Event";
import {executeJS} from "./JSExecutor";

const statementSplitRegExp = / /;
const lineSplitRegExp = /;[\n ]+/mgs;
const lineClearEndsRegExp = /^.+?(?=;)/mgs;

export interface MSScriptOptions {}

export const INTERNAL_COMMANDS: MSCommands = commandsFromObject({
    let (args, vars) {
      vars.set(args[0], args[1]);
    },
    println(args, _, se) {
      se.emit('stdout', args[0]);
    }
  });

export type MSPrecompiledScript = {command: string; args: MSArgument[]}[];
export type MSVariables = Map<string, any>;

export class MSEngine {
  variables: MSVariables;
  registeredCommands: Map<string, MSCommand>;
  precompiledScript: MSPrecompiledScript;
  listeners: MSEventListener[] = [];
  constructor(scriptText: string, commands: MSCommands, initialVariables?: object, _options?: Partial<MSScriptOptions>) {
    this.variables = new Map<string, any>(Object.entries(initialVariables ?? {}));
    this.registeredCommands = new Map([...commands, ...INTERNAL_COMMANDS]);
    this.precompiledScript = this.precompileScript(scriptText);
  }

  precompileScript(scriptText: string) {
    let precompiledScript: MSPrecompiledScript;

    let scriptLines = 
      scriptText
        .split(lineSplitRegExp)
        .map((line, index, arr) => index == arr.length - 1 ? line.match(lineClearEndsRegExp)[0] : line);

    let scriptStatements = scriptLines.map(val => {
      let parts = val.split(statementSplitRegExp);
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

  runPrecompiledScript(precompiledScript: MSPrecompiledScript) {
    for (const statement of precompiledScript) {
      let commandToExecute = this.registeredCommands.get(statement.command);
      if (!commandToExecute) throw new Error("No such command: " + statement.command);
      let formattedArguments = statement.args.map(arg => {
        if (arg.type === MSArgumentType.Normal) return arg.value;
        if (arg.type === MSArgumentType.VariableReference) {
          let theVar = this.variables.get(arg.value);
          if (!theVar) throw new Error("No variable with name: " + arg.value);
          return theVar;
        }
        if (arg.type === MSArgumentType.JavaScript) {
          return executeJS(this.variables, arg.value);
        }
      });
      commandToExecute(formattedArguments, this.variables, this);
    }
    this.emit('completed');
  }

  compileAndRun(scriptText: string) {
    let precompiledScript = this.precompileScript(scriptText);
    this.runPrecompiledScript(precompiledScript);
  }

  on(type: MSEventType, callback: MSEventListenerCallback) {
    this.listeners.push({
      type, callback
    })
  }

  removeListener(callback: MSEventListenerCallback) {
    this.listeners.filter(val => val.callback === callback).forEach(listener => this.listeners.splice(this.listeners.findIndex(val => val === listener)));
  }

  emit(type: MSEventType, detail?: any) {
    this.listeners.filter(val => val.type === type).forEach(listener => listener.callback({detail}))
  }
}

