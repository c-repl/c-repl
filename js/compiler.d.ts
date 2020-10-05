import { PromiseValue } from "type-fest";
import e from "execa";
interface Flavoring<FlavorT> {
    _type?: FlavorT;
}
export declare type Nominal<T, FlavorT> = T & Flavoring<FlavorT>;
/**
 * C Expression text i.e no decalration allowed
 */
export declare type cExpression = Nominal<string, "cExpression">;
/**
 * Valid C program Soruce Code
 */
export declare type sourceCode = Nominal<string, "sourceCode">;
export interface sFile extends PromiseValue<ReturnType<typeof makeSourceFile>> {
}
export interface oFile extends PromiseValue<ReturnType<typeof makeObjectFile>> {
}
export interface soFile extends PromiseValue<ReturnType<typeof makeSharedObject>> {
}
export interface aFile extends PromiseValue<ReturnType<typeof makeExecObject>> {
}
export declare function makeSourceFile(textSrc: sourceCode, extension?: string): Promise<{
    id: string;
    extension: string;
    name: string;
    type: "sfile";
    src: Nominal<string, "sourceCode">;
    time: number;
}>;
export declare function makeObjectFile(sfile: sFile, extension?: string): Promise<{
    id: string;
    extension: string;
    name: string;
    src: sFile;
    type: "ofile";
    _gcc_result: e.ExecaReturnValue<string>;
    time: number;
}>;
export declare function makeSharedObject(ofile: oFile, extension?: string): Promise<{
    id: string;
    extension: string;
    name: string;
    src: oFile;
    type: "sofile";
    _gcc_result: e.ExecaReturnValue<string>;
    time: number;
}>;
export declare function codetoo(textSrc: sourceCode): Promise<{
    id: string;
    extension: string;
    name: string;
    src: sFile;
    type: "ofile";
    _gcc_result: e.ExecaReturnValue<string>;
    time: number;
}>;
export declare function codetoso(textSrc: sourceCode): Promise<{
    id: string;
    extension: string;
    name: string;
    src: oFile;
    type: "sofile";
    _gcc_result: e.ExecaReturnValue<string>;
    time: number;
}>;
export declare function makeExecObject(files: (soFile | oFile)[], moreoptions?: string[], extension?: string): Promise<{
    id: string;
    extension: string;
    name: string;
    src: (oFile | soFile)[];
    type: "afile";
    _gcc_result: e.ExecaReturnValue<string>;
    time: number;
}>;
export {};
//# sourceMappingURL=compiler.d.ts.map