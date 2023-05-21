export function partialFunction(func: Function) {
  let args = Array.prototype.slice.call(arguments).splice(1);
  return function () {
    let allArgs = args.concat(Array.prototype.slice.call(arguments));
    return func.apply(this, allArgs);
  }
}
