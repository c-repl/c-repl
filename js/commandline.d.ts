import { TalktoGdb } from "talk-to-gdb";
import { EventEmitterExtended } from "listen-for-patterns";
import Program from "./program";
import { sFile } from "./compiler";
export default class Runner extends EventEmitterExtended {
    program: Program;
    gdb: TalktoGdb;
    initialized: boolean;
    baseFile(): Promise<{
        fd: number;
        name: string;
        ext: "cpp";
        type: "sfile";
    }>;
    constructor(file?: sFile);
    init(): Promise<void>;
    private evaluate;
    private compile;
    run(code: string, libs?: string[]): Promise<any>;
}
//# sourceMappingURL=commandline.d.ts.map