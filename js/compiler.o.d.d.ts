export function makeObjectFile(sfile: any): Promise<{
    id: any;
    name: string;
    src: any;
    type: string;
    _gcc_result: import("execa").ExecaReturnValue<string>;
    time: any;
}>;
export function makeSharedObject(ofile: any): Promise<{
    id: any;
    name: string;
    src: any;
    type: string;
    _gcc_result: import("execa").ExecaReturnValue<string>;
    time: any;
}>;
export function makeSourceFile(textSrc: any): Promise<{
    id: string;
    name: string;
    type: string;
    src: any;
    time: number;
}>;
export function codetoso(textSrc: any): Promise<{
    id: any;
    name: string;
    src: any;
    type: string;
    _gcc_result: import("execa").ExecaReturnValue<string>;
    time: any;
}>;
export function makeExecObject(sofiles: any, options?: any[]): Promise<{
    id: string;
    name: any;
    src: any;
    type: string;
    _gcc_result: import("execa").ExecaReturnValue<string>;
    time: number;
}>;
//# sourceMappingURL=compiler.o.d.d.ts.map