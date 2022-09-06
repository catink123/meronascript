import anyTest from 'ava/entrypoints/main';
import {ExecutionContext, TestFn} from 'ava/types/test-fn';
import {MSEngine} from './src';
import {MSArgumentType} from './src/Argument';
import {commandsFromObject} from './src/Command';
import {MSEvent} from './src/Event';

const test = anyTest as TestFn<{engine: MSEngine, printingText: string, testScript: string}>;

test.before('Setup MSEngine', (t: ExecutionContext) => {
  t.context.printingText = 'Logging from MeronaScript!';
  t.context.testScript = `println '${t.context.printingText}';println |2 + 2|;`;
  t.context.engine = new MSEngine(t.context.testScript, commandsFromObject({}));
})

test('is the precompiledScript right?', (t: ExecutionContext) => {
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
          value: '2 + 2'
        }
      ]
    }
  ];
  t.is(JSON.stringify(t.context.engine.precompiledScript), JSON.stringify(expectedPrecompiledScript));
});

test('is it runnable?', (t: ExecutionContext) => {
  t.context.engine.on('stdout', (e: MSEvent) => t.log(e.detail));
  t.context.engine.run();
  t.pass('it does!');
});

test('does it run hot-loaded code?', (t: ExecutionContext) => {
  t.context.engine.compileAndRun('let text "Text in a variable";println text;');
  t.pass('it does!');
})
