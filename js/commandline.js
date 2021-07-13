"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const talk_to_gdb_1 = require("talk-to-gdb");
const listen_for_patterns_1 = require("listen-for-patterns");
const program_1 = __importDefault(require("./program"));
const compiler_1 = require("./compiler");
class Runner extends listen_for_patterns_1.EventEmitterExtended {
    constructor(file) {
        super();
        this.gdb = new talk_to_gdb_1.TalktoGdb();
        this.program = new program_1.default({
            gdb: this.gdb,
            file: new Promise(async (res) => res(compiler_1.compile(file || await this.baseFile(), compiler_1.filetypes.afile, ["-ldl"])))
        });
        this.initialized = false;
    }
    baseFile() {
        return compiler_1.makeCppFile(`#include<stdio.h>\n#include<dlfcn.h>\nint main(){;printf("Exiting!%d",dlopen);};int dtata(){\n};int hy=90;\nchar tr;\nstruct hua{int h;\n};int tada(){}`);
    }
    async init() {
        try {
            await this.program.start();
            this.initialized = true;
        }
        catch (e) {
            throw "failed to initilize";
        }
    }
    async evaluate(code) {
        return this.program.evaluate(code);
    }
    async compile(code, libs = []) {
        for (let header of this.program.headers) {
            code = `#include <${header.name}>\n${code}`;
        }
        var sFile = await compiler_1.makeCppFile(code);
        var soFile = await compiler_1.compile(sFile, compiler_1.filetypes.sofile, libs);
        return this.program.loadFile(soFile);
    }
    async run(code, libs = []) {
        if (!libs.length && code.search(";") == -1)
            return this.evaluate(code);
        else {
            return this.compile(code, libs);
        }
    }
}
exports.default = Runner;
//# sourceMappingURL=commandline.js.map