import anyTest, {ExecutionContext, TestFn} from 'ava';
import {MSEngine} from '.';
import {MSArgumentType} from './Argument';
import {commandsFromObject} from './Command';
import {MSEvent} from './Event';

interface TestContext {engine: MSEngine, printingText: string, testScript: string}
const test = anyTest as TestFn<TestContext>;

test.before('Setup MSEngine', (t: ExecutionContext) => {
  let printingText = 'Logging from MeronaScript!';
  let testScript = `println '${printingText}'; println |"A JavaScript value: " + Math.random()|;`;
  let engine = new MSEngine(testScript, commandsFromObject({}));
  t.context = {printingText, testScript, engine};
});

test('is the precompiledScript right?', (t: ExecutionContext<TestContext>) => {
  const expectedPrecompiledScript = [
    {
      command: 'println',
      args: [
        {
          type: MSArgumentType.Normal,
          value: t.context.printingText
        }
      ]
    },
    {
      command: 'println',
      args: [
        {
          type: MSArgumentType.JavaScript,
          value: '"A JavaScript value: " + Math.random()'
        }
      ]
    }
  ];
  t.is(JSON.stringify(t.context.engine.precompiledScript), JSON.stringify(expectedPrecompiledScript));
});

test('is it runnable?', (t: ExecutionContext<TestContext>) => {
  let listener = (e: MSEvent) => t.log(e.detail);
  t.context.engine.on('stdout', listener);
  t.context.engine.run();
  t.context.engine.removeListener(listener);
  t.pass('it does!');
});

test('does it run hot-loaded code?', (t: ExecutionContext<TestContext>) => {
  let listener = (e: MSEvent) => t.log(e.detail);
  t.context.engine.on('stdout', listener);
  t.context.engine.compileAndRun("let 'text' 'Text in a variable'; println text; let 'x' 2; let 'y' 5; println |`Using JavaScript to compute values: x = ${x}, y = ${y}, x * y = ${x * y}`|; func 'testfunc' 'println \"Logging to stdout from a function!\";'; testfunc;");
  t.context.engine.removeListener(listener);
  t.pass('it does!');
})
