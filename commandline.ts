import { TalktoGdb } from "talk-to-gdb"
import { EventEmitterExtended, pattern } from "listen-for-patterns"
import Program from "./program"
import { sFile, makeCppFile, compile, filetypes } from "./compiler";
export default class Runner extends EventEmitterExtended {
    program: Program
    gdb: TalktoGdb
    initialized: boolean
    baseFile() {
        return makeCppFile(`#include<stdio.h>\n#include<dlfcn.h>\nint main(){;printf("Exiting!%d",dlopen);};int dtata(){\n};int hy=90;\nchar tr;\nstruct hua{int h;\n};int tada(){}`)
    }
    constructor(file?: sFile) {
        super()
        this.gdb = new TalktoGdb()
        this.program = new Program({
            gdb: this.gdb,
            file: new Promise(async res => res(compile(file || await this.baseFile(), filetypes.afile, ["-ldl"])))
        })
        this.initialized = false
    }
    async init() {
        try {
            await this.program.start()
            this.initialized = true
        }
        catch (e) { throw "failed to initilize" }
    }
    private async evaluate(code: string) {
        return this.program.evaluate(code)
    }
    private async compile(code: string, libs: string[] = []) {
        for (let header of this.program.headers) {
            code = `#include <${header.name}>\n${code}`;
        }
        var sFile = await makeCppFile(code)
        var soFile = await compile(sFile, filetypes.sofile, libs)
        return this.program.loadFile(soFile)
    }
    async run(code: string, libs: string[] = []) {
        if (!libs.length && code.search(";") == -1) return this.evaluate(code)
        else {
            return  this.compile(code, libs);
        }
    }
}