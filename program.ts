import { TalktoGdb } from "talk-to-gdb";
import path from "path"
import { aFile, headerFile, makeHeaderFile, oFile, sFile, soFile } from "./compiler";
import { get_info, protoize } from "cpp-meta-data"
function getsrc(s: soFile | oFile): sFile[] {
    if (s.type == 'ofile')
        return s.src
    else //if (s.type == 'sofile')
        return s.src.map(getsrc).flat()
    // else console.error("should never be here")
}
function getobj(s: soFile | aFile | oFile): oFile {
    if (s.type == 'sofile')
        return s.src[0]
    else if (s.type == 'ofile')
        return s
    else //if (s.type == 'afile')
        return getobj(s.src[0])
    // else console.error("should never be here")
}
interface definition { line: string, def: string }
export default class Program {
    file: aFile | Promise<aFile>
    gdb: TalktoGdb
    headers: headerFile[]
    info: Array<{ functions: definition[], variables: definition[], types: definition[] }>
    running = false
    constructor({ gdb, file }: { gdb: TalktoGdb, file: aFile | Promise<aFile> }) {
        this.gdb = gdb
        this.file = file
        this.info = []
        this.headers = []
    }
    async evaluate(expression: string) {
        var result = await this.gdb.getResult("-data-evaluate-expression", expression)
        if (result.class === "error")
            throw "Error in expression evaluation: " + result.msg
        else return result
    }

    async preserveSymbols(file: aFile | soFile) {
        var sourcefiles = getobj(file).src
        var { code, info } = await protoize(sourcefiles[0].name, getobj(file).name)
        this.headers.push(await makeHeaderFile(`#ifndef ${path.basename(sourcefiles[0].name)}
#define ${path.basename(sourcefiles[0].name)}
${code}
#endif
`));
        this.info.push(info)
    }
    async loadFile(file: aFile | soFile) {
        await this.evaluate(`dlopen("${file.name}",1)`)
        return this.preserveSymbols(file)
    }
    async start() {
        if (this.running) return true
        else {
            this.file = await this.file
            await this.gdb.changeFile(this.file.name)
            await this.preserveSymbols(this.file)
            await this.gdb.waitFor("-break-insert main")
            await this.gdb.waitFor("-exec-run")
            return true
        }
    }
}