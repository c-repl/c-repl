import { sourceCode } from "./compiler";
export declare function preProcess(code: sourceCode): Promise<string>;
export declare function cpp(code: sourceCode): Promise<string>;
export declare function pretty(code: sourceCode): Promise<string>;
export declare function splitStatements(s: sourceCode): {
    conditionalCount: number;
    statements: (string | {
        i: number;
        statement: string;
    })[];
    declarations: ({
        name: string;
        value: string;
        declaration: string;
    } | null)[];
};
//# sourceMappingURL=preprocess.d.ts.map