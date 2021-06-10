"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSharedObject = void 0;
const util_1 = require("./util");
const execa_1 = __importDefault(require("execa"));
async function makeSharedObject(ofiles, libs = [""], ext) {
    if (!(ofiles instanceof Array)) {
        ofiles = [ofiles];
    }
    var filename = util_1.getname(ofiles.map(s => s.name)) + `.${ext}`;
    var gccLinkerOptions = ["-w", "-shared", ...util_1.options, ...ofiles.map(s => s.name), "-o", filename, "-ldl"];
    var out = await execa_1.default("g++", gccLinkerOptions);
    if (out.stderr)
        throw out.stderr;
    return {
        ext,
        name: filename,
        src: ofiles,
        type: "sofile",
        _gcc_result: out,
    };
}
exports.makeSharedObject = makeSharedObject;
//# sourceMappingURL=shareobject.js.map