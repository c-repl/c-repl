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
exports.makeExecObject = exports.codetoso = exports.codetoo = exports.makeSharedObject = exports.makeObjectFile = exports.makeSourceFile = void 0;
const tmp = __importStar(require("tmp"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const crypto_1 = require("crypto");
const execa_1 = __importDefault(require("execa"));
const tmpdir = tmp.dirSync();
const md5sum = crypto_1.createHash('md5');
const uoptions = ["-fno-eliminate-unused-debug-types", "-g3", "-O0", "-rdynamic"];
async function makeSourceFile(textSrc, extension = "c") {
    var file = tmp.fileSync({ dir: tmpdir.name, postfix: `.${extension}` });
    fs.writeFileSync(file.fd, textSrc);
    return {
        id: file.name.split(".")[0],
        extension,
        name: file.name,
        type: "sfile",
        src: textSrc,
        time: Date.now()
    };
}
exports.makeSourceFile = makeSourceFile;
async function makeObjectFile(sfile, extension = "o") {
    var filename = sfile.id + `.${extension}`;
    var gccCompileOptions = [
        "-w",
        "-Wall",
        "-fPIC",
        "-c",
        ...uoptions,
        sfile.name,
        "-o",
        filename
    ];
    var out = await execa_1.default("g++", gccCompileOptions);
    if (out.stderr)
        throw out.stderr;
    return {
        id: sfile.id,
        extension,
        name: filename,
        src: sfile,
        type: "ofile",
        _gcc_result: out,
        time: sfile.time
    };
}
exports.makeObjectFile = makeObjectFile;
async function makeSharedObject(ofile, extension = "so") {
    var filename = ofile.id + `.${extension}`;
    var gccLinkerOptions = ["-w", "-shared", ...uoptions, ofile.name, "-o", filename, "-ldl"];
    var out = await execa_1.default("g++", gccLinkerOptions);
    if (out.stderr)
        throw out.stderr;
    return {
        id: ofile.id,
        extension,
        name: filename,
        src: ofile,
        type: "sofile",
        _gcc_result: out,
        time: ofile.time
    };
}
exports.makeSharedObject = makeSharedObject;
async function codetoo(textSrc, pp = true) {
    var s = await makeSourceFile(textSrc, pp ? "c" : "i");
    return makeObjectFile(s);
}
exports.codetoo = codetoo;
async function codetoso(textSrc, pp = true) {
    var o = await codetoo(textSrc, pp);
    var so = await makeSharedObject(o);
    return so;
}
exports.codetoso = codetoso;
async function makeExecObject(files, moreoptions = [], extension = "a") {
    var filenames = files.map(file => path.basename(file.name)).sort();
    var hash = md5sum.copy().update(filenames.join("")).digest('hex');
    var filename = path.join(tmpdir.name, hash + `.${extension}`);
    var gccLinkerOptions = [`-Wl,-rpath=${tmpdir.name}`, ...uoptions, "-o", path.basename(filename)].concat(filenames).concat(moreoptions);
    var out = await execa_1.default("g++", gccLinkerOptions, { cwd: tmpdir.name, env: { LD_LIBRARY_PATH: tmpdir.name } });
    if (out.stderr)
        throw out.stderr;
    return {
        id: hash,
        extension,
        name: filename,
        src: files,
        type: "afile",
        _gcc_result: out,
        time: Date.now()
    };
}
exports.makeExecObject = makeExecObject;
//# sourceMappingURL=compiler.js.map