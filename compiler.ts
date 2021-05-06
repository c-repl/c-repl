import tmp from "tmp"
import fs from "fs"
import e from "execa"
import path from "path"
/**************************************************************************** */
import { PromiseValue } from "type-fest";

export interface sFile extends PromiseValue<ReturnType<typeof makeSourceFile>> { }
export interface cppsFile extends PromiseValue<ReturnType<typeof makeCppFile>> { }
export interface cppsFileProcessed extends PromiseValue<ReturnType<typeof makeCppFile>> { }
export interface headerFile extends PromiseValue<ReturnType<typeof makeHeaderFile>> { }
export interface oFile extends PromiseValue<ReturnType<typeof makeObjectFile>> { }
export interface soFile extends PromiseValue<ReturnType<typeof makeSharedObject>> { }
export interface aFile extends PromiseValue<ReturnType<typeof makeExecObject>> { }
/******************************************************************************/
import { createHash } from "crypto"
const md5sum = createHash('md5')
const tmpdir = tmp.dirSync();
function getname(filenames: string[] | string) {
  if (typeof filenames == 'string') return path.join(tmpdir.name, filenames)
  return path.join(tmpdir.name, md5sum.copy().update(filenames.sort().join("")).digest('hex'))
}

/******************************************************************************/

const options = ["-fno-eliminate-unused-debug-types", "-g3", "-O0", "-rdynamic"]

/******************************************************************************/
export async function makeSourceFile<T extends string>(textSrc: string, ext: T) {
  var file = tmp.fileSync({ dir: tmpdir.name, postfix: `.${ext}` });
  fs.writeFileSync(file.fd, textSrc);
  return {
    fd: file.fd,
    name: file.name,
    ext,
    type: "sfile" as "sfile"
  };
}
export async function makeCppFile(textSrc: string = "") {
  return makeSourceFile(textSrc, 'cpp')
}
export async function makeCppFilepp(textSrc: string = "") {
  return makeSourceFile(textSrc, 'i')
}
export async function makeHeaderFile(textSrc: string = "") {
  return makeSourceFile(textSrc, 'h')
}
/******************************************************************************/

export async function makeObjectFile(sfiles: sFile | sFile[]) {
  var name;
  if (!(sfiles instanceof Array)) {
    name = path.basename(sfiles.name).split(".")[0]
    sfiles = [sfiles]
  }

  var filename = getname(name || sfiles.map((s: { name: string }) => s.name)) + `.o`;
  var gccCompileOptions = [
    "-w",
    "-Wall",
    "-fPIC",
    "-c",
    ...options,
    ...sfiles.map((s: { name: string }) => s.name),
    "-o",
    filename
  ];
  var out = await e("g++", gccCompileOptions);
  if (out.stderr) throw out.stderr
  return {
    ext: 'o',
    name: filename,
    src: sfiles,
    type: "ofile" as "ofile",
    _gcc_result: out
  };
}

/******************************************************************************/
export async function makeSharedObject(files: oFile | oFile[], libs: string[] = []) {
  var name = ""
  if (!(files instanceof Array)) {
    name = path.basename(files.name).split(".")[0]
    files = [files]
  }
  var filename = getname(name || files.map((s: { name: string }) => s.name)) + `.so`;
  var gccLinkerOptions = ["-w", "-shared", ...options, ...files.map((s: { name: string }) => s.name), "-o", filename, ...libs];
  var out = await e("g++", gccLinkerOptions);
  if (out.stderr) throw out.stderr
  return {
    name: filename,
    ext: 'so',
    src: files,
    type: "sofile" as "sofile",
    _gcc_result: out
  };
}
/******************************************************************************/
export async function makeExecObject(files: (soFile | oFile) | ((soFile | oFile)[]), libs: string[] = []) {
  var name;
  if (!(files instanceof Array)) {
    name = path.basename(files.name).split(".")[0]
    files = [files]
  }
  var filename = getname(name || files.map((s: { name: string }) => s.name)) + `.a`;
  var gccLinkerOptions = [`-Wl,-rpath=${tmpdir.name}`, ...options, "-o", path.basename(filename), ...files.map((s: { name: string }) => s.name), ...libs]
  var out = await e("g++", gccLinkerOptions, { cwd: tmpdir.name, env: { LD_LIBRARY_PATH: tmpdir.name } });
  if (out.stderr) throw out.stderr
  return {
    ext: 'a',
    name: filename,
    src: files,
    type: "afile" as "afile",
    _gcc_result: out
  };
}
/******************************************************************************* */

export enum filetypes { "ofile", "sofile", "afile" }
export async function compile(code: sFile | oFile | soFile | aFile, target: filetypes.ofile, libs?: string[]): Promise<oFile>
export async function compile(code: sFile | oFile | soFile | aFile, target: filetypes.sofile, libs?: string[]): Promise<soFile>
export async function compile(code: sFile | oFile | soFile | aFile, target: filetypes.afile, libs?: string[]): Promise<aFile>
export async function compile(code: sFile | oFile | soFile | aFile, target: filetypes = 2, libs: string[] = []) {

  if (target >= filetypes.ofile && code.type == "sfile") {
    code = await makeObjectFile(code)
  }
  if (target == filetypes.sofile && code.type == "ofile") {
    code = await makeSharedObject(code, libs)
  }
  if (target >= filetypes.afile && (code.type == "sofile" || code.type == "ofile")) {
    code = await makeExecObject(code, libs)
  }
  return code
}