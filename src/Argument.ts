export enum MSArgumentType {
  Normal,
  VariableReference,
  JavaScript
}

export interface MSArgument {
  type: MSArgumentType,
  value: any
}

export function parseArgString(argString: string): MSArgument[] {
  let args: MSArgument[] = [];
  let currentWorkingString = '';
  let isCurArgString = false;
  let isCurArgJS = false;
  for (const char of argString) {
    if (char === "|") {
      if (!isCurArgString) {
        if (isCurArgJS) {
          isCurArgJS = false;
          args.push({type: MSArgumentType.JavaScript, value: currentWorkingString});
          currentWorkingString = '';
        } else isCurArgJS = true;
      } else 
        currentWorkingString += char;

      continue;
    }
    if (char === "'") {
      if (isCurArgJS) {
        currentWorkingString += char;
        continue;
      }
      if (!isCurArgString) {
        isCurArgString = true;
        continue;
      } else {
        isCurArgString = false;
        args.push({type: MSArgumentType.Normal, value: currentWorkingString});
        currentWorkingString = '';
      }
    }
    if (char === ' ' && !isCurArgString && !isCurArgJS) 
      args.push(parseValue(currentWorkingString));
    else currentWorkingString += char;
  }
  // if (currentWorkingString.length > 0) args.push(isCurArgString ? currentWorkingString : parseValue(currentWorkingString));
  return args;
}

function parseValue(value: string): MSArgument {
  let returnValue: any;
  let argType = MSArgumentType.Normal;
  if (value.match(/[a-z]/i)) { // Is some kind of text
    if (value.match(/^true$|^false$/)) returnValue = value === 'true' ? true : false // Is boolean, convert to boolean
    else { // Is a plain string, that means it is a variable name, as strings are parsed in the main parseArgString function
      returnValue = value;
      argType = MSArgumentType.VariableReference;
    }
  } else if (value.match(/[0-9]/)) { // Is a number or a float
    if (value.includes('.')) returnValue = parseFloat(value)
    else returnValue = parseInt(value);
  }

  return {
    type: argType,
    value: returnValue
  }
}
