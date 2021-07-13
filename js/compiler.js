"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = exports.filetypes = exports.makeExecObject = exports.makeSharedObject = exports.makeObjectFile = exports.makeHeaderFile = exports.makeCppFilepp = exports.makeCppFile = exports.makeSourceFile = void 0;
const tmp_1 = __importDefault(require("tmp"));
const fs_1 = __importDefault(require("fs"));
const execa_1 = __importDefault(require("execa"));
const path_1 = __importDefault(require("path"));
/******************************************************************************/
const crypto_1 = require("crypto");
const cpp_meta_data_1 = require("cpp-meta-data");
const md5sum = crypto_1.createHash('md5');
const tmpdir = tmp_1.default.dirSync();
function getname(filenames) {
    if (typeof filenames == 'string')
        return path_1.default.join(tmpdir.name, filenames);
    return path_1.default.join(tmpdir.name, md5sum.copy().update(filenames.sort().join("")).digest('hex'));
}
/******************************************************************************/
const options = ["-fno-eliminate-unused-debug-types", "-g3", "-O0", "-rdynamic"];
/******************************************************************************/
async function makeSourceFile(textSrc, ext) {
    var file = tmp_1.default.fileSync({ dir: tmpdir.name, postfix: `.${ext}` });
    fs_1.default.writeFileSync(file.fd, textSrc);
    return {
        fd: file.fd,
        name: file.name,
        ext,
        type: "sfile"
    };
}
exports.makeSourceFile = makeSourceFile;
async function makeCppFile(textSrc = "") {
    textSrc = await cpp_meta_data_1.pretty(textSrc);
    textSrc = cpp_meta_data_1.fixWrapping(textSrc).join("\n");
    return makeSourceFile(textSrc, 'cpp');
}
exports.makeCppFile = makeCppFile;
async function makeCppFilepp(textSrc = "") {
    return makeSourceFile(textSrc, 'i');
}
exports.makeCppFilepp = makeCppFilepp;
async function makeHeaderFile(textSrc = "") {
    return makeSourceFile(textSrc, 'h');
}
exports.makeHeaderFile = makeHeaderFile;
/******************************************************************************/
async function makeObjectFile(sfiles) {
    var name;
    if (!(sfiles instanceof Array)) {
        name = path_1.default.basename(sfiles.name).split(".")[0];
        sfiles = [sfiles];
    }
    var filename = getname(name || sfiles.map((s) => s.name)) + `.o`;
    var gccCompileOptions = [
        "-w",
        "-Wall",
        "-fPIC",
        "-c",
        ...options,
        ...sfiles.map((s) => s.name),
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
    var filename = getname(name || files.map((s) => s.name)) + `.so`;
    var gccLinkerOptions = ["-w", "-shared", ...options, ...files.map((s) => s.name), "-o", filename, ...libs];
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
    var filename = getname(name || files.map((s) => s.name)) + `.a`;
    var gccLinkerOptions = [`-Wl,-rpath=${tmpdir.name}`, ...options, "-o", path_1.default.basename(filename), ...files.map((s) => s.name), ...libs];
    var out = await execa_1.default("g++", gccLinkerOptions, { cwd: tmpdir.name, env: { LD_LIBRARY_PATH: tmpdir.name } });
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
    filetypes[filetypes["afile"] = 2] = "afile";
})(filetypes = exports.filetypes || (exports.filetypes = {}));
async function compile(code, target = 2, libs = []) {
    if (target >= filetypes.ofile && code.type == "sfile") {
        code = await makeObjectFile(code);
    }
    if (target == filetypes.sofile && code.type == "ofile") {
        code = await makeSharedObject(code, libs);
    }
    if (target >= filetypes.afile && (code.type == "sofile" || code.type == "ofile")) {
        code = await makeExecObject(code, libs);
    }
    return code;
}
exports.compile = compile;
//# sourceMappingURL=compiler.js.map