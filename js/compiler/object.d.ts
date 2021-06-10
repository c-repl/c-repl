import { sFile } from "./types";
import e from "execa";
export declare function makeObjectFile(sfiles: sFile | sFile[]): Promise<{
    ext: string;
    name: string;
    src: sFile[];
    type: "ofile";
    _gcc_result: e.ExecaReturnValue<string>;
}>;
//# sourceMappingURL=object.d.ts.map