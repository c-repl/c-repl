"use strict";
// @ts-nocheck
const repl = require('repl');
var r = require('./commandline').default;
const chalk = require('chalk');
var cli = new r;
async function main() {
    await cli.init();
    const r = repl.start({ prompt: 'c++ > ', eval: evaluator, writer: writer, });
    async function evaluator(cmd, context, filename, callback) {
        debugger;
        try {
            var result = await cli.run(cmd.trim());
            callback(null, result);
        }
        catch (e) {
            callback(null, (e instanceof Error) ? e : new Error(e));
        }
    }
    function writer(output) {
        if (output instanceof Error)
            return `${chalk.red(">> error")} : ${output.message} `;
        return output?.value || chalk.green(">> compiled");
    }
}
main();
//# sourceMappingURL=repl.js.map