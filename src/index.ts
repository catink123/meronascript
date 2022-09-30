import {MSArgumentType, parseArgString, MSArgument} from "./Argument";
import {commandsFromObject, MSCommand, MSCommands} from "./Command";
import {MSEventType, MSEventListener} from "./Event";

export interface MSScriptOptions {}

export const INTERNAL_COMMANDS: MSCommands = commandsFromObject({
    let (args, vars, se) {
      vars.set(args[0], args[1]);
      se.emit('stdout', args);
      se.emit('stdout', vars);
    },
    println(args, _, se) {
      se.emit('stdout', args[0]);
    }
  });

export type MSPrecompiledScript = {command: string; args: MSArgument[]}[];

export class MSEngine {
  variables: Map<string, any>;
  registeredCommands: Map<string, MSCommand>;
  precompiledScript: MSPrecompiledScript;
  listeners = [];
  constructor(scriptText: string, commands: MSCommands, initialVariables?: object, _options?: Partial<MSScriptOptions>) {
    this.variables = new Map<string, any>(Object.entries(initialVariables ?? {}));
    this.registeredCommands = new Map([...commands, ...INTERNAL_COMMANDS]);
    this.precompiledScript = this.precompileScript(scriptText);
  }

  precompileScript(scriptText: string) {
    let precompiledScript: MSPrecompiledScript;

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
          return eval(arg.value);
        }
      });
      commandToExecute(formattedArguments, this.variables, this);
    }
  }

  compileAndRun(scriptText: string) {
    let precompiledScript = this.precompileScript(scriptText);
    this.runPrecompiledScript(precompiledScript);
  }

  on(type: MSEventType, callback: MSEventListener) {
    this.listeners.push({
      type, callback
    })
  }

  removeListener(callback: MSEventListener) {
    this.listeners.filter(val => val.callback === callback).forEach(listener => this.listeners.splice(this.listeners.findIndex(listener)));
  }

  emit(type: MSEventType, detail: any) {
    this.listeners.filter(val => val.type === type).forEach(listener => listener.callback({detail}))
  }
}

