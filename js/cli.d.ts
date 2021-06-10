import { TalkToGdb } from "talk-to-gdb";
import { EventEmitterExtended } from "listen-for-patterns";
import { cExpression, sourceCode, soFile, aFile, Nominal, oFile } from "./compiler";
declare type CompilationSource = sourceCode | {
    text: string;
    lib?: string[];
};
declare type baseFile = Nominal<aFile | CompilationSource | oFile, "baseFile">;
declare type path = Nominal<string, "path">;
import { GdbParser } from "gdb-parser-extended";
export { GdbParser };
export declare class CRepl extends EventEmitterExtended {
    #private;
    initialized: boolean;
    primary: TalkToGdb | undefined;
    secondary: TalkToGdb | undefined;
    private escape;
    private defaultBaseCode;
    private init;
    constructor(file?: baseFile);
    compile(code: CompilationSource, pp?: boolean, target?: (aFile | oFile | soFile)["type"]): Promise<any>;
    loadso(file: path): Promise<Object>;
    evaluate(code: cExpression, command: string, get: "output"): Promise<AsyncIterable<Object>>;
    evaluate(code: cExpression, command: string, get: "resultonly"): Promise<Object>;
    evaluate(code: cExpression, command: string): Promise<Object>;
    evaluate(code: cExpression): Promise<Object>;
    commandConsole(command: string): Promise<AsyncIterable<Object>>;
    commandMi(command: string): Promise<AsyncIterable<Object>>;
    getAttrib(file: soFile | aFile): void;
    evaluateCommand(arg: string, ...args: string[]): Promise<any>;
    run(code: sourceCode): ReturnType<CRepl["compile"]>;
    run(code: cExpression): ReturnType<CRepl["evaluate"]>;
}
export declare function evaluate(o: CRepl, code: cExpression, command?: string, get?: ("resultonly" | "output")): Promise<void>;
/**
1-break-insert main
2-exec-run

 */ 
//# sourceMappingURL=cli.d.ts.map