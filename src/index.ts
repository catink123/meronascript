import {MSArgumentType} from "./Argument";
import {commandsFromObject, MSCommand, MSCommands} from "./Command";
import {MSPrecompiledScript, precompileScript} from "./Compiler";
import {MSEventType, MSEventListenerCallback, MSEventListener} from "./Event";
import {executeJS} from "./JSExecutor";

export interface MSScriptOptions {}

export const INTERNAL_COMMANDS: MSCommands = commandsFromObject({
  let (args, vars) {
    vars.set(args[0], args[1]);
  },
  println (args, _, se) {
    se.emit('stdout', args.map(val => JSON.stringify(val)).join(', '));
  },
  func (args, _, se) {
    se.registeredCommands.set(args[0], se.compileAndRun.bind(se, args[1]));
  }
});

export type MSVariables = Map<string, any>;
export enum MSRunFlag {
  // InsideCommandGroup
}

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
    return precompileScript(scriptText);
  }

  run() {
    this.runPrecompiledScript(this.precompiledScript);
  }

  runPrecompiledScript(precompiledScript: MSPrecompiledScript, flags?: MSRunFlag[]) {
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
        // if (arg.type === MSArgumentType.CommandGroup) {
        //   return this.runPrecompiledScript(arg.value);
        // }
      });
      commandToExecute(formattedArguments, this.variables, this);
    }
    if (flags) {
      // if (flags.includes(MSRunFlag.InsideCommandGroup)) this.emit('completedInCG');
    } else
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

