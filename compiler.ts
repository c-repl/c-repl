import { PromiseValue } from "type-fest"
import * as tmp from "tmp"
import * as path from "path"
import * as fs from 'fs'
import { createHash } from "crypto"
import e from "execa"
const tmpdir = tmp.dirSync();
const md5sum = createHash('md5')
interface Flavoring<FlavorT> {
  _type?: FlavorT;
}
export type Nominal<T, FlavorT> = T & Flavoring<FlavorT>;
/**
 * C Expression text i.e no decalration allowed
 */
export type cExpression = Nominal<string, "cExpression">
/**
 * Valid C program Soruce Code
 */
export type sourceCode = Nominal<string, "sourceCode">
export interface sFile extends PromiseValue<ReturnType<typeof makeSourceFile>> { }
export interface oFile extends PromiseValue<ReturnType<typeof makeObjectFile>> { }
export interface soFile extends PromiseValue<ReturnType<typeof makeSharedObject>> { }
export interface aFile extends PromiseValue<ReturnType<typeof makeExecObject>> { }
const uoptions = ["-fno-eliminate-unused-debug-types", "-g3", "-O0", "-rdynamic"]
export async function makeSourceFile(textSrc: sourceCode, extension = "c") {
  var file = tmp.fileSync({ dir: tmpdir.name, postfix: `.${extension}` });
  fs.writeFileSync(file.fd, textSrc);
  return {
    id: file.name.split(".")[0],
    extension,
    name: file.name,
    type: "sfile" as "sfile",
    src: textSrc,
    time: Date.now()
  };
}
export async function makeObjectFile(sfile: sFile, extension = "o") {
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
  var out = await e("g++", gccCompileOptions);
  if (out.stderr) throw out.stderr
  return {
    id: sfile.id,
    extension,
    name: filename,
    src: sfile,
    type: "ofile" as "ofile",
    _gcc_result: out,
    time: sfile.time
  };
}
export async function makeSharedObject(ofile: oFile, extension = "so") {
  var filename = ofile.id + `.${extension}`;
  var gccLinkerOptions = ["-w", "-shared", ...uoptions, ofile.name, "-o", filename, "-ldl"];
  var out = await e("g++", gccLinkerOptions);
  if (out.stderr) throw out.stderr
  return {
    id: ofile.id,
    extension,
    name: filename,
    src: ofile,
    type: "sofile" as "sofile",
    _gcc_result: out,
    time: ofile.time
  };
}
export async function codetoo(textSrc: sourceCode, pp = true) {
  var s = await makeSourceFile(textSrc, pp ? "c" : "i")
  return makeObjectFile(s)
}
export async function codetoso(textSrc: sourceCode, pp = true) {

  var o = await codetoo(textSrc, pp)
  var so = await makeSharedObject(o)
  return so
}
export async function makeExecObject(files: (soFile | oFile)[], moreoptions: string[] = [], extension = "a") {
  var filenames = files.map(file => path.basename(file.name)).sort()
  var hash = md5sum.copy().update(filenames.join("")).digest('hex')
  var filename = path.join(tmpdir.name, hash + `.${extension}`);
  var gccLinkerOptions = [`-Wl,-rpath=${tmpdir.name}`, ...uoptions, "-o", path.basename(filename)].concat(filenames).concat(moreoptions);
  var out = await e("g++", gccLinkerOptions, { cwd: tmpdir.name, env: { LD_LIBRARY_PATH: tmpdir.name } });
  if (out.stderr) throw out.stderr
  return {
    id: hash,
    extension,
    name: filename,
    src: files,
    type: "afile" as "afile",
    _gcc_result: out,
    time: Date.now()
  };
}