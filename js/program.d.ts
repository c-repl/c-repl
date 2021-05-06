import { TalktoGdb } from "talk-to-gdb";
import { aFile, headerFile, soFile } from "./compiler";
interface definition {
    line: string;
    def: string;
}
export default class Program {
    file: aFile | Promise<aFile>;
    gdb: TalktoGdb;
    headers: headerFile[];
    info: Array<{
        functions: definition[];
        variables: definition[];
        types: definition[];
    }>;
    running: boolean;
    constructor({ gdb, file }: {
        gdb: TalktoGdb;
        file: aFile | Promise<aFile>;
    });
    evaluate(expression: string): Promise<any>;
    preserveSymbols(file: aFile | soFile): Promise<void>;
    loadFile(file: aFile | soFile): Promise<void>;
    start(): Promise<boolean>;
}
export {};
//# sourceMappingURL=program.d.ts.map