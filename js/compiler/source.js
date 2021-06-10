"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = exports.filetypes = exports.makeExecObject = exports.makeSharedObject = exports.makeObjectFile = exports.makeHeaderFile = exports.makeCppFilepp = exports.makeCppFile = exports.makeSourceFile = exports.tmpdir = void 0;
const tmp = __importStar(require("tmp"));
const fs = __importStar(require("fs"));
const crypto_1 = require("crypto");
const execa_1 = __importDefault(require("execa"));
const path_1 = __importDefault(require("path"));
const util_1 = require("./util");
exports.tmpdir = tmp.dirSync();
const md5sum = crypto_1.createHash('md5');
/**
 * Valid C program Soruce Code
 */
const options = ["-fno-eliminate-unused-debug-types", "-g3", "-O0", "-rdynamic"];
async function makeSourceFile(textSrc, ext) {
    var file = tmp.fileSync({ dir: exports.tmpdir.name, postfix: `.${ext}` });
    fs.writeFileSync(file.fd, textSrc);
    return {
        fd: file.fd,
        name: file.name,
        ext,
        type: "sfile"
    };
}
exports.makeSourceFile = makeSourceFile;
async function makeCppFile(textSrc) {
    return await makeSourceFile(textSrc, "cpp");
}
exports.makeCppFile = makeCppFile;
async function makeCppFilepp(textSrc) {
    return await makeSourceFile(textSrc, 'i');
}
exports.makeCppFilepp = makeCppFilepp;
async function makeHeaderFile(textSrc) {
    return await makeSourceFile(textSrc, 'h');
}
exports.makeHeaderFile = makeHeaderFile;
/******************************************************************************/
async function makeObjectFile(sfiles) {
    var name;
    if (!(sfiles instanceof Array)) {
        name = path_1.default.basename(sfiles.name).split(".")[0];
        sfiles = [sfiles];
    }
    var filename = util_1.getname(name || sfiles.map(s => s.name)) + `.o`;
    var gccCompileOptions = [
        "-w",
        "-Wall",
        "-fPIC",
        "-c",
        ...options,
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
/******************************************************************************/
async function makeSharedObject(files, libs = []) {
    var name = "";
    if (!(files instanceof Array)) {
        name = path_1.default.basename(files.name).split(".")[0];
        files = [files];
    }
    var filename = util_1.getname(name || files.map(s => s.name)) + `.so`;
    var gccLinkerOptions = ["-w", "-shared", ...options, ...files.map(s => s.name), "-o", filename, ...libs];
    var out = await execa_1.default("g++", gccLinkerOptions);
    if (out.stderr)
        throw out.stderr;
    return {
        name: filename,
        ext: 'so',
        src: files,
        type: "sofile",
        _gcc_result: out
    };
}
exports.makeSharedObject = makeSharedObject;
/******************************************************************************/
async function makeExecObject(files, libs = []) {
    var name;
    if (!(files instanceof Array)) {
        name = path_1.default.basename(files.name).split(".")[0];
        files = [files];
    }
    var filename = util_1.getname(name || files.map(s => s.name)) + `.a`;
    var gccLinkerOptions = [`-Wl,-rpath=${exports.tmpdir.name}`, ...options, "-o", path_1.default.basename(filename), ...files.map(s => s.name), ...libs];
    var out = await execa_1.default("g++", gccLinkerOptions, { cwd: exports.tmpdir.name, env: { LD_LIBRARY_PATH: exports.tmpdir.name } });
    if (out.stderr)
        throw out.stderr;
    return {
        ext: 'a',
        name: filename,
        src: files,
        type: "afile",
        _gcc_result: out
    };
}
exports.makeExecObject = makeExecObject;
/******************************************************************************* */
var filetypes;
(function (filetypes) {
    filetypes[filetypes["ofile"] = 0] = "ofile";
    filetypes[filetypes["sofile"] = 1] = "sofile";
    filetypes[filetypes["aFile"] = 2] = "aFile";
})(filetypes = exports.filetypes || (exports.filetypes = {}));
async function compile(code, target = 2, libs = []) {
    if (target >= filetypes.ofile && code.type == "sfile") {
        code = await makeObjectFile(code);
    }
    if (target == filetypes.sofile && code.type == "ofile") {
        code = await makeSharedObject(code, libs);
    }
    if (target >= filetypes.aFile && (code.type == "sofile" || code.type == "ofile")) {
        code = await makeExecObject(code, libs);
    }
    return code;
}
exports.compile = compile;
//# sourceMappingURL=source.js.map