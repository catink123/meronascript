#!/usr/bin/env node --experimental-specifier-resolution=node
import anyTest from 'ava';
import { MSEngine } from '.';
import { MSArgumentType } from './Argument';
import { commandsFromObject } from './Command';
const test = anyTest;
test.before('Setup MSEngine', (t) => {
    let printingText = 'Logging from MeronaScript!';
    let testScript = `println '${printingText}';println |2 + 2|;`;
    let engine = new MSEngine(testScript, commandsFromObject({}));
    t.context = { printingText, testScript, engine };
});
test('is the precompiledScript right?', (t) => {
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
test('is it runnable?', (t) => {
    t.context.engine.on('stdout', (e) => t.log(e.detail));
    t.context.engine.run();
    t.pass('it does!');
});
test('does it run hot-loaded code?', (t) => {
    t.context.engine.compileAndRun(`let 'text' 'Text in a variable';println text`);
    t.pass('it does!');
});
