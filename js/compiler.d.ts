import e from "execa";
/**************************************************************************** */
import { PromiseValue } from "type-fest";
export interface sFile extends PromiseValue<ReturnType<typeof makeSourceFile>> {
}
export interface cppsFile extends PromiseValue<ReturnType<typeof makeCppFile>> {
}
export interface cppsFileProcessed extends PromiseValue<ReturnType<typeof makeCppFile>> {
}
export interface headerFile extends PromiseValue<ReturnType<typeof makeHeaderFile>> {
}
export interface oFile extends PromiseValue<ReturnType<typeof makeObjectFile>> {
}
export interface soFile extends PromiseValue<ReturnType<typeof makeSharedObject>> {
}
export interface aFile extends PromiseValue<ReturnType<typeof makeExecObject>> {
}
/******************************************************************************/
export declare function makeSourceFile<T extends string>(textSrc: string, ext: T): Promise<{
    fd: number;
    name: string;
    ext: T;
    type: "sfile";
}>;
export declare function makeCppFile(textSrc?: string): Promise<{
    fd: number;
    name: string;
    ext: "cpp";
    type: "sfile";
}>;
export declare function makeCppFilepp(textSrc?: string): Promise<{
    fd: number;
    name: string;
    ext: "i";
    type: "sfile";
}>;
export declare function makeHeaderFile(textSrc?: string): Promise<{
    fd: number;
    name: string;
    ext: "h";
    type: "sfile";
}>;
/******************************************************************************/
export declare function makeObjectFile(sfiles: sFile | sFile[]): Promise<{
    ext: string;
    name: string;
    src: sFile[];
    type: "ofile";
    _gcc_result: e.ExecaReturnValue<string>;
}>;
/******************************************************************************/
export declare function makeSharedObject(files: oFile | oFile[], libs?: string[]): Promise<{
    name: string;
    ext: string;
    src: oFile[];
    type: "sofile";
    _gcc_result: e.ExecaReturnValue<string>;
}>;
/******************************************************************************/
export declare function makeExecObject(files: (soFile | oFile) | ((soFile | oFile)[]), libs?: string[]): Promise<{
    ext: string;
    name: string;
    src: (oFile | soFile)[];
    type: "afile";
    _gcc_result: e.ExecaReturnValue<string>;
}>;
/******************************************************************************* */
export declare enum filetypes {
    "ofile" = 0,
    "sofile" = 1,
    "afile" = 2
}
export declare function compile(code: sFile | oFile | soFile | aFile, target: filetypes.ofile, libs?: string[]): Promise<oFile>;
export declare function compile(code: sFile | oFile | soFile | aFile, target: filetypes.sofile, libs?: string[]): Promise<soFile>;
export declare function compile(code: sFile | oFile | soFile | aFile, target: filetypes.afile, libs?: string[]): Promise<aFile>;
//# sourceMappingURL=compiler.d.ts.map