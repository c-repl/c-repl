"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeObjectFile = void 0;
const util_1 = require("./util");
const execa_1 = __importDefault(require("execa"));
async function makeObjectFile(sfiles) {
    if (!(sfiles instanceof Array))
        sfiles = [sfiles];
    var filename = util_1.getname(sfiles.map(s => s.name)) + `.o`;
    var gccCompileOptions = [
        "-w",
        "-Wall",
        "-fPIC",
        "-c",
        ...util_1.options,
        ...sfiles.map(s => s.name),
        "-o",
        filename
    ];
    var out = await execa_1.default("g++", gccCompileOptions);
    if (out.stderr)
        throw out.stderr;
    return {
        ext: 'o',
        name: filename,
        src: sfiles,
        type: "ofile",
        _gcc_result: out
    };
}
exports.makeObjectFile = makeObjectFile;
//# sourceMappingURL=object.js.map