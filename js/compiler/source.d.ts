import * as tmp from "tmp";
import e from "execa";
import { aFile, oFile, sFile, soFile, sourceCode } from "./types";
export declare const tmpdir: tmp.DirResult;
interface Flavoring<FlavorT> {
    _type?: FlavorT;
}
export declare type Nominal<T, FlavorT> = T & Flavoring<FlavorT>;
/**
 * C Expression text i.e no decalration allowed
 */
export declare type cExpression = Nominal<string, "cExpression">;
export declare function makeSourceFile<T extends string>(textSrc: sourceCode, ext: T): Promise<{
    fd: number;
    name: string;
    ext: T;
    type: "sfile";
}>;
export declare function makeCppFile(textSrc: string): Promise<{
    fd: number;
    name: string;
    ext: "cpp";
    type: "sfile";
}>;
export declare function makeCppFilepp(textSrc: string): Promise<{
    fd: number;
    name: string;
    ext: "i";
    type: "sfile";
}>;
export declare function makeHeaderFile(textSrc: string): Promise<{
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
    "aFile" = 2
}
export declare function compile(code: sFile | oFile | soFile | aFile, target?: filetypes, libs?: string[]): Promise<sFile | oFile | soFile | aFile>;
export {};
//# sourceMappingURL=source.d.ts.map