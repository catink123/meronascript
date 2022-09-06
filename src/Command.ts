import {MSEngine} from ".";

export type MSCommand = (args?: any[], vars?: Map<string, any>, scriptEngine?: MSEngine) => void;

export type MSCommands = Map<string, MSCommand>;

export function commandsFromObject(commandObject: {[key: string]: MSCommand}) {
  let commands: MSCommands = new Map(
    Object.entries(commandObject)
  );

  return commands;
}

