import execa from "execa";
import { Nominal } from "talk-to-gdb";
import { sourceCode } from "./compiler";
export async function cpp(code: sourceCode) {
    var e = execa("cpp")
    await e.stdin?.write(code)
    await e.stdin?.end();
    return (await e).stdout
}
export function splitStatements(s: sourceCode) {
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
// function extractinit(s) {
//     if (!s.endsWith(';')) return null;
//     else {
//         var feq = undefined;
//         var stack = []
//         var braces = "(){}[]";
//         for (var i = 0; i < s.length; i++) {
//             if (stack.length == 0 && s[i] == '=') {
//                 feq = i;
//                 break
//             }
//             else {
//                 var sym = braces.indexOf(s[i]);
//                 if (sym == -1) continue;
//                 else if (sym % 2 == 0) {//means open braces
//                     stack.push(s[i])
//                 }
//                 else {
//                     var pairsym = braces.indexOf(stack.pop());
//                     if (sym - pairsym !== 1) throw "bracket mismatch at " + i;
//                     else if (s[i] == "}" && stack.length == 0) lastcurleddat = i;
//                 }
//             }
//         }
//         //if(stack.length!=0)throw "bracket mismatch at "+i;
//         if (i == s.length) return null
//         else {
//             var name = s.slice(0, feq).split(" ").pop()//or use regex
//             return { name, def: s.slice(feq + 1) }
//         }
//     }
//     return feq
// }
function parseDeclaration(s: Nominal<string, "declaration+assignment">) {

    var indexOfEq = s.length;
    var stack: string[] = []
    var braces = "(){}[]";
    for (var i = 0; i < s.length; i++) {
        if (stack.length == 0 && s[i] == '=' && s[i - 1] == " " && s[i + 1] == " ") {
            indexOfEq = i;
            break
        }
        else {
            var matchedAt = braces.indexOf(s[i]);
            if (matchedAt == -1) continue;
            else if (matchedAt % 2 == 0) {//means open braces
                stack.push(s[i])
            }
            else if (stack.length > 0) { //or closing bracket
                var pairsym = braces.indexOf(stack.pop() as string);
                if (matchedAt - pairsym !== 1) throw "bracket mismatch at " + i;
            }
            else throw "inconsitancy in bracket pairs at " + i
        }
    }
    if (i == s.length) return null
    else {
        var declaration = s.slice(0, indexOfEq).trim()
        var name = declaration.split(" ").pop() as string//or use regex
        return { name, value: s.slice(indexOfEq + 1).trim(), declaration }
    }
}