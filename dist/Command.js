export function commandsFromObject(commandObject) {
    let commands = new Map(Object.entries(commandObject));
    return commands;
}
