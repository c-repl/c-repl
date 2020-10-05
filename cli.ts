import { TalkToGdb } from "talk-to-gdb"
import { EventEmitterExtended, pattern } from "listen-for-patterns"
import { cExpression, sourceCode, codetoso, makeExecObject, codetoo, soFile, aFile, Nominal, oFile } from "./compiler"
type CompilationSource = sourceCode | { text: string, lib?: string[] }
type baseFile = Nominal<aFile | CompilationSource | oFile, "baseFile">
type path = Nominal<string, "path">
import { GdbParser } from "gdb-parser-extended";
export { GdbParser }
export class CRepl extends EventEmitterExtended {
    initialized: boolean
    primary: TalkToGdb | undefined
    secondary: TalkToGdb | undefined
    #file: baseFile
    private escape(str: string) {
        return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')
    }
    private defaultBaseCode() {
        return { text: `#include<stdio.h>\n#include<dlfcn.h>\nint main(){;printf("Exiting!%d",dlopen);};`, lib: ["-ldl"] }
    }
    private async init() {
        try {
            if ("type" in this.#file) {
                if (this.#file.type == 'ofile') this.#file = await makeExecObject([this.#file])
            }
            else if (typeof this.#file == 'string') {
                this.#file = await makeExecObject([await codetoo(this.#file)])
            }
            else if ("text" in this.#file) {
                this.#file = await makeExecObject([await codetoo(this.#file.text)], this.#file.lib)
            } else throw "Illegal base file"

            this.primary = new TalkToGdb({ target: this.#file.name });
            await this.primary.write("1-break-insert main\n");
            await this.primary.write("1-exec-run\n");
            this.primary.once({ token: "1" }, (data) => {
                console.log(data.token, data)
            })
            this.secondary = new TalkToGdb()
            this.initialized = true
        }
        catch (e) {
            throw { e, message: "Error in initializing Cli" }
        }
    }
    constructor(file?: baseFile) {
        super()
        this.#file = file || this.defaultBaseCode();
        this.primary = undefined
        this.secondary = undefined
        this.initialized = false
    }
    async compile(code: CompilationSource, target: (aFile | oFile | soFile)["type"] = "afile") {
        if (typeof code != 'string') {
            var lib = "lib" in code ? code.lib : [];
            code = "text" in code ? code.text : code;
        }
        if (target == 'ofile') return codetoo(code)
        else if (target == 'sofile') return codetoso(code)
        else if (target == 'afile') return makeExecObject([await codetoo(code)], lib)
        else throw "illegal compilation target"
    }
    loadso(file: path) {
        return this.evaluate(this.escape(`dlopen("${file}",RTLD_GLOBAL|RTLD_NOW)`))
    }
    async evaluate(code: cExpression, command: string, get: "output"): Promise<AsyncIterable<Object>>
    async evaluate(code: cExpression, command: string, get: "resultonly"): Promise<Object>
    async evaluate(code: cExpression, command: string): Promise<Object>
    async evaluate(code: cExpression): Promise<Object>
    async evaluate(code: cExpression, command = "-data-evaluate-expression", get: ("resultonly" | "output") = "resultonly"): Promise<AsyncIterable<Object> | Object> {
        if (!this.initialized) await this.init()
        var token = await (this.primary as TalkToGdb).write(`${command} "${code}"\n`);
        return (this.primary as TalkToGdb).readPattern({ token, type: get == "resultonly" ? "result_record" : "sequence" })
    }
    commandConsole(command: string) {
        return this.evaluate(command, "-interpreter-exec console", "output")
    }
    commandMi(command: string) {
        return this.evaluate("", command, "output")
    }
    getAttrib(file: soFile | aFile) {

    }
    async evaluateCommand(arg: string, ...args: string[]) {
        var token = await this.primary?.command(arg, ...args);
        if (typeof token == "number")
            return this.primary?.readPattern({ token, type: 'sequence' });
    }
    async run(code: sourceCode): ReturnType<CRepl["compile"]>
    async run(code: cExpression): ReturnType<CRepl["evaluate"]>
    async run(code: sourceCode | cExpression) {
        /**
         * @mermaid Operating Sequence Diagram
         * sequenceDiagram
         *     par
         *          CLI->>GDB: Execute this code as an expression! 
         *          GDB->>+CLI: GDB output error or success of expression execution!
         *      and
         *          CLI->>+GCC: try to compile this code!
         *          GCC->>+CLI: Compilation report !
         *      end
         */
        /** */
        if (code.search(";") == -1) return this.evaluate(code as cExpression)
        else {
            var so = await this.compile(code as sourceCode, "sofile");
            return this.loadso(so.name)
        }
    }
}
// var r=new CRepl({})
// var u=r.run("d" as cExpression)
export async function evaluate(o: CRepl, code: cExpression, command = "-data-evaluate-expression", get: ("resultonly" | "output") = "resultonly") {
    if (get == "output")
        for await (let each of await o.evaluate(code, command, get)) console.log(":: ", each)
    else if (get == "resultonly") console.log(await o.evaluate(code, command, get))
}
/**
1-break-insert main
2-exec-run

 */