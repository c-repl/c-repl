function groups(state: { cursor: number, eaten: number, string: string, lastCurlClosed: number }) {
    var { cursor, eaten, string } = state;
    var braces = "(){}[]";
    var matchedbracket = braces.indexOf(string[cursor])
    if (string[cursor] in ["(", "{", "["]) {
        var stack: string[] = [];
        var matchedAt;
        for (; ((matchedAt = braces.indexOf(string[cursor])) - matchedbracket !== 1) && cursor < string.length; cursor++) {
            if (matchedAt == -1) continue;
            else if (matchedAt % 2 == 0) {//means open braces
                stack.push(string[cursor])
            }
            else if (stack.length > 0) {
                var pairBracket = braces.indexOf(stack.pop() as string);
                if (matchedAt - pairBracket !== 1) throw "bracket mismatch at " + cursor;
                else if (string[cursor] == "}" && stack.length == 0) state.lastCurlClosed = cursor;;
            } else throw "unexpected closing bracket at " + cursor;
            if (stack.length == 0)//all pair matched
                break
            cursor += 1
        }
        if (!stack.length)//unmatched pairs
            throw "bracket mismatch at " + cursor;
        else {
            var start = state.cursor;
            state.cursor = cursor;
            return { type: "group", bracket: string[start], range: { start, end: cursor } }
        }

    }
    return null
}
function statement(state/*** state */: { cursor: number, eaten: number, string: string }) {
    var { cursor, eaten, string } = state;
    if (string[cursor] == ';') {
        state.cursor++;
        state.eaten = cursor + 1;
        return { type: "Single Line Comment", text: string.slice(eaten, cursor + 1), range: { start: eaten, end: cursor } }
    }
    else return null;
}
function comments(state/*** state */: { i: number, s: string }, cb: { (result: { type: string, text: string, range: { start: number, end: number } }): any }) {
    var { i, s } = state;
    if (s[i] == '/' && s[i + 1] == '*') {
        var def = ''
        while (!(s[i] == '*' && s[i + 1] == '/')) def += s[i++];
        def += '*/'
        i += 1;
        var start = state.i;
        state.i = i;
        return cb({ type: "Single Line Comment", text: def.trim(), range: { start, end: i } })
    }
    else if (s[i] == '/' && s[i + 1] == '*') {
        var def = ''
        while (!(s[i] == '*' && s[i + 1] == '/')) def += s[i++];
        def += '*/'
        i += 1;
        var start = state.i;
        state.i = i;
        return cb({ type: "MultiLine  Comment", text: def.trim(), range: { start, end: i } })
    }
    else if (s[i] == '#') {
        var def = ''
        while (s[i] != '\n')
            def += s[i++];
        var start = state.i;
        state.i = i;
        return cb({ type: "Preprocessor  Comment", text: def.trim(), range: { start, end: i } })
    }
}
export function SplitStatements(s: string) {
    var stack: string[] = [];
    var statements: string[] = [];
    var finishedtill = 0;
    var lastCurlClosedAt = -1;
    var braces = "(){}[]";
    for (var i = 0; i < s.length; i++) {
        if (stack.length == 0) {
            if (s[i] == '/' && s[i + 1] == '*') {
                var def = ''
                while (!(s[i] == '*' && s[i + 1] == '/')) def += s[i++];
                def += '*/'
                i += 1;
                statements.push(def.trim())
                finishedtill = i + 1;
            }
            else if (s[i] == '/' && s[i + 1] == '/') {
                var def = ''
                while (s[i] != '\n') def += s[i++];
                statements.push(def.trim())
                finishedtill = i + 1;
            }
            else if (s[i] == '#') {
                var def = ''
                while (s[i] != '\n')
                    def += s[i++];
                statements.push(def.trim())
                finishedtill = i + 1;
            }
            else if (s[i] == ';') {
                statements.push(s.slice(finishedtill, i + 1).trim());
                finishedtill = i + 1
            }
            else if (s[i] == "{" && finishedtill < lastCurlClosedAt + 1) {
                statements.push(s.slice(finishedtill, lastCurlClosedAt + 1).trim());
                finishedtill = lastCurlClosedAt + 1;
            }
        }
        var matchedAt = braces.indexOf(s[i]);
        if (matchedAt == -1) continue;
        else if (matchedAt % 2 == 0) {//means open braces
            stack.push(s[i])
        }
        else if (stack.length > 0) {
            var pairsym = braces.indexOf(stack.pop() as string);
            if (matchedAt - pairsym !== 1) throw "bracket mismatch at " + i;
            else if (s[i] == "}" && stack.length == 0) lastCurlClosedAt = i;
        } else throw "inconsitancy in bracket pairs at " + i

    }
    statements.push(s.slice(finishedtill, i).trim());
    var declarations: ReturnType<typeof parseDeclaration>[] = []
    var conditionalCount = 0;
    var result: (string | { i: number, statement: string })[] = []
    var pack = (i: number, t: string) => `void __method__${i}(){${t}}`
    for (var i = 0; i < statements.length; i++) {
        var decl: ReturnType<typeof parseDeclaration> = null;
        if (statements[i].search(/^if/) > -1) {
            if (statements[i + 1]?.search(/^else/) > -1) {
                result.push(statements[i])
            }
            else {
                result.push(pack(conditionalCount++, statements[i]))
            }
        } else if (statements[i].search(/^else/) > -1) {
            if (statements[i + 1]?.search(/^else/) > -1) {
                result.push(result.pop() + statements[i])
            }
            else {
                result.push(pack(conditionalCount++, result.pop() + statements[i]))
            }
        }
        else if (statements[i].search(/^for[ ]?\(/) > -1 || statements[i].search(/^while[ ]?\(/) > -1 || statements[i].search(/do[ ]?\{/) > -1) {
            result.push(pack(conditionalCount++, statements[i]))
        }
        else if (decl = parseDeclaration(statements[i])) {
            declarations.push(decl);
            result.push(statements[i])
        }

    }
    // function treatDangledElse(s: ReturnType<typeof splitStatements>["statements"]) {
    //     var result: typeof s = []
    //     for (var i = 0; i < s.length; i++) {
    //         if (s[i].search(/^if/) > -1) {
    //             if (s[i + 1]?.search(/^else/) > -1) {
    //                 result.push(s[i])
    //             }
    //             else {
    //                 result.push(`void __method__${conditionalCount++}(){${s[i]}}`)
    //             }
    //         } if (s[i].search(/^else/) > -1) {
    //             if (s[i + 1]?.search(/^else/) > -1) {
    //                 result.push(result.pop() + s[i])
    //             }
    //             else {
    //                 result.push(`void __method__${conditionalCount++}(){${result.pop() + s[i]}}`)
    //             }
    //         }
    //         for (var i = 0; i < s.length; i++) {
    //             if (s[i].search(/^else/) > -1) {
    //                 result.push(result.pop() + s[i])
    //             }
    //             else result.push(s[i])
    //         }
    //         for (var i = 0; i < result.length; i++) {
    //             if (result[i].search(/^if/) > -1) {
    //                 result[i] = `void __method__${conditionalCount++}(){${statements[i]}}`
    //             }
    //             else result.push(s[i])
    //         }
    //         return result
    //     }
    return { conditionalCount, statements: result, declarations }
}