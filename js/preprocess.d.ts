export declare function preProcess(code: string): Promise<string>;
export declare function cpp(code: string): Promise<string>;
export declare function pretty(code: string): Promise<string>;
export declare function splitStatements(s: string, preproccesd?: boolean): Promise<{
    conditionalCount: number;
    statements: string[];
    declarations: string[];
}>;
//# sourceMappingURL=preprocess.d.ts.map