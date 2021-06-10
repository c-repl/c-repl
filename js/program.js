"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const compiler_1 = require("./compiler");
const cpp_meta_data_1 = require("cpp-meta-data");
function getsrc(s) {
    if (s.type == 'ofile')
        return s.src;
    else //if (s.type == 'sofile')
        return s.src.map(getsrc).flat();
    // else console.error("should never be here")
}
function getobj(s) {
    if (s.type == 'sofile')
        return s.src[0];
    else if (s.type == 'ofile')
        return s;
    else //if (s.type == 'afile')
        return getobj(s.src[0]);
    // else console.error("should never be here")
}
class Program {
    constructor({ gdb, file }) {
        this.running = false;
        this.gdb = gdb;
        this.file = file;
        this.info = [];
        this.headers = [];
    }
    async evaluate(expression) {
        var result = await this.gdb.getResult("-data-evaluate-expression", expression);
        if (result.class === "error")
            throw "Error in expression evaluation: " + result.msg;
        else
            return result;
    }
    async preserveSymbols(file) {
        var sourcefiles = getobj(file).src;
        var { code, info } = await cpp_meta_data_1.protoize(sourcefiles[0].name, getobj(file).name);
        this.headers.push(await compiler_1.makeHeaderFile(`#ifndef ${path_1.default.basename(sourcefiles[0].name)}
#define ${path_1.default.basename(sourcefiles[0].name)}
${code}
#endif
`));
        this.info.push(info);
    }
    async loadFile(file) {
        await this.evaluate(`dlopen("${file.name}",1)`);
        return this.preserveSymbols(file);
    }
    async start() {
        if (this.running)
            return true;
        else {
            this.file = await this.file;
            await this.gdb.changeFile(this.file.name);
            await this.preserveSymbols(this.file);
            await this.gdb.waitFor("-break-insert main");
            await this.gdb.waitFor("-exec-run");
            return true;
        }
    }
}
exports.default = Program;
//# sourceMappingURL=program.js.map