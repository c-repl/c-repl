import { oFile } from "./types";
import e from "execa";
export declare function makeSharedObject<T extends "so" | "dll">(ofiles: oFile | oFile[], libs: string[] | undefined, ext: T): Promise<{
    ext: T;
    name: string;
    src: oFile[];
    type: "sofile";
    _gcc_result: e.ExecaReturnValue<string>;
}>;
//# sourceMappingURL=shareobject.d.ts.map