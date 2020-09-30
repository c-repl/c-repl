import { TalkToGdb } from "talk-to-gdb";
import { EventEmitterExtended } from "listen-for-patterns";
import { cExpression, sourceCode, soFile, aFile, Nominal, oFile } from "./compiler";
declare type CompilationSource = sourceCode | {
    text: string;
    lib?: string[];
};
declare type baseFile = Nominal<aFile | CompilationSource | oFile, "baseFile">;
declare type path = Nominal<string, "path">;
export declare class CRepl extends EventEmitterExtended {
    #private;
    initialized: boolean;
    primary: TalkToGdb | undefined;
    secondary: TalkToGdb | undefined;
    private escape;
    private defaultBaseCode;
    private init;
    constructor(file?: baseFile);
    compile(code: CompilationSource, target?: (aFile | oFile | soFile)["type"]): Promise<{
        id: string;
        name: string;
        src: import("./compiler").sFile;
        type: "ofile";
        _gcc_result: import("execa").ExecaReturnValue<string>;
        time: number;
    } | {
        id: string;
        name: string;
        src: oFile;
        type: "sofile";
        _gcc_result: import("execa").ExecaReturnValue<string>;
        time: number;
    } | {
        id: string;
        name: string;
        src: (oFile | soFile)[];
        type: "afile";
        _gcc_result: import("execa").ExecaReturnValue<string>;
        time: number;
    }>;
    loadso(file: path): Promise<Object>;
    evaluate(code: cExpression, command: string, get: "output"): Promise<AsyncIterable<Object>>;
    evaluate(code: cExpression, command: string, get: "resultonly"): Promise<Object>;
    evaluate(code: cExpression, command: string): Promise<Object>;
    evaluate(code: cExpression): Promise<Object>;
    commandConsole(command: string): Promise<AsyncIterable<Object>>;
    commandMi(command: string): Promise<AsyncIterable<Object>>;
    getAttrib(file: soFile | aFile): void;
    run(code: sourceCode): ReturnType<CRepl["compile"]>;
    run(code: cExpression): ReturnType<CRepl["evaluate"]>;
}
export declare function evaluate(o: CRepl, code: cExpression, command?: string, get?: ("resultonly" | "output")): Promise<void>;
export {};
/**
1-break-insert main
2-exec-run

 */ 
//# sourceMappingURL=cli.d.ts.map