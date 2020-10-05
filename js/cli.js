"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = exports.CRepl = exports.GdbParser = void 0;
const talk_to_gdb_1 = require("talk-to-gdb");
const listen_for_patterns_1 = require("listen-for-patterns");
const compiler_1 = require("./compiler");
const preprocess_1 = require("./preprocess");
const gdb_parser_extended_1 = require("gdb-parser-extended");
Object.defineProperty(exports, "GdbParser", { enumerable: true, get: function () { return gdb_parser_extended_1.GdbParser; } });
class CRepl extends listen_for_patterns_1.EventEmitterExtended {
    constructor(file) {
        super();
        this.#file = file || this.defaultBaseCode();
        this.primary = undefined;
        this.secondary = undefined;
        this.initialized = false;
    }
    #file;
    escape(str) {
        return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    }
    defaultBaseCode() {
        return { text: `#include<stdio.h>\n#include<dlfcn.h>\nint main(){;printf("Exiting!%d",dlopen);};`, lib: ["-ldl"] };
    }
    async init() {
        try {
            if ("type" in this.#file) {
                if (this.#file.type == 'ofile')
                    this.#file = await compiler_1.makeExecObject([this.#file]);
            }
            else if (typeof this.#file == 'string') {
                this.#file = await compiler_1.makeExecObject([await compiler_1.codetoo(this.#file)]);
            }
            else if ("text" in this.#file) {
                this.#file = await compiler_1.makeExecObject([await compiler_1.codetoo(this.#file.text)], this.#file.lib);
            }
            else
                throw "Illegal base file";
            this.primary = new talk_to_gdb_1.TalkToGdb({ target: this.#file.name });
            await this.primary.write("1-break-insert main\n");
            await this.primary.write("1-exec-run\n");
            this.primary.once({ token: "1" }, (data) => {
                console.log(data.token, data);
            });
            this.secondary = new talk_to_gdb_1.TalkToGdb();
            this.initialized = true;
        }
        catch (e) {
            throw { e, message: "Error in initializing Cli" };
        }
    }
    async compile(code, pp = false, target = "afile") {
        if (typeof code != 'string') {
            var lib = "lib" in code ? code.lib : [];
            code = "text" in code ? code.text : code;
        }
        if (target == 'ofile')
            return compiler_1.codetoo(code, pp);
        else if (target == 'sofile')
            return compiler_1.codetoso(code, pp);
        else if (target == 'afile')
            return compiler_1.makeExecObject([await compiler_1.codetoo(code, pp)], lib);
        else
            throw "illegal compilation target";
    }
    loadso(file) {
        return this.evaluate(this.escape(`dlopen("${file}",RTLD_GLOBAL|RTLD_NOW)`));
    }
    async evaluate(code, command = "-data-evaluate-expression", get = "resultonly") {
        if (!this.initialized)
            await this.init();
        var token = await this.primary.write(`${command} "${code}"\n`);
        return this.primary.readPattern({ token, type: get == "resultonly" ? "result_record" : "sequence" });
    }
    commandConsole(command) {
        return this.evaluate(command, "-interpreter-exec console", "output");
    }
    commandMi(command) {
        return this.evaluate("", command, "output");
    }
    getAttrib(file) {
    }
    async evaluateCommand(arg, ...args) {
        var token = await this.primary?.command(arg, ...args);
        if (typeof token == "number")
            return this.primary?.readPattern({ token, type: 'sequence' });
    }
    async run(code) {
        /**
         * @mermaid Operating Sequence Diagram
         * sequenceDiagram
         *     par
         *          CLI->>GDB: Execute this code as an expression!
         *          GDB->>+CLI: GDB output error or success of expression execution!
         *      and
         *          CLI->>+GCC: try to compile this code!
         *          GCC->>+CLI: Compilation report !
         *      end
         */
        /** */
        if (code.search(";") == -1)
            return this.evaluate(code);
        else {
            var so = await this.compile(await preprocess_1.preProcess(code), false, "sofile");
            return this.loadso(so.name);
        }
    }
}
exports.CRepl = CRepl;
// var r=new CRepl({})
// var u=r.run("d" as cExpression)
async function evaluate(o, code, command = "-data-evaluate-expression", get = "resultonly") {
    if (get == "output")
        for await (let each of await o.evaluate(code, command, get))
            console.log(":: ", each);
    else if (get == "resultonly")
        console.log(await o.evaluate(code, command, get));
}
exports.evaluate = evaluate;
/**
1-break-insert main
2-exec-run

 */ 
//# sourceMappingURL=cli.js.map