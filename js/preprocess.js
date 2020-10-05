"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitStatements = exports.cpp = void 0;
const execa_1 = __importDefault(require("execa"));
async function cpp(code) {
    var e = execa_1.default("cpp");
    await e.stdin?.write(code);
    await e.stdin?.end();
    return (await e).stdout;
}
exports.cpp = cpp;
function splitStatements(s) {
    var stack = [];
    var statements = [];
    var finishedtill = 0;
    var lastCurlClosedAt = -1;
    var braces = "(){}[]";
    for (var i = 0; i < s.length; i++) {
        if (stack.length == 0) {
            if (s[i] == '/' && s[i + 1] == '*') {
                var def = '';
                while (!(s[i] == '*' && s[i + 1] == '/'))
                    def += s[i++];
                def += '*/';
                i += 1;
                statements.push(def.trim());
                finishedtill = i + 1;
            }
            else if (s[i] == '/' && s[i + 1] == '/') {
                var def = '';
                while (s[i] != '\n')
                    def += s[i++];
                statements.push(def.trim());
                finishedtill = i + 1;
            }
            else if (s[i] == '#') {
                var def = '';
                while (s[i] != '\n')
                    def += s[i++];
                statements.push(def.trim());
                finishedtill = i + 1;
            }
            else if (s[i] == ';') {
                statements.push(s.slice(finishedtill, i + 1).trim());
                finishedtill = i + 1;
            }
            else if (s[i] == "{" && finishedtill < lastCurlClosedAt + 1) {
                statements.push(s.slice(finishedtill, lastCurlClosedAt + 1).trim());
                finishedtill = lastCurlClosedAt + 1;
            }
        }
        var matchedAt = braces.indexOf(s[i]);
        if (matchedAt == -1)
            continue;
        else if (matchedAt % 2 == 0) { //means open braces
            stack.push(s[i]);
        }
        else if (stack.length > 0) {
            var pairsym = braces.indexOf(stack.pop());
            if (matchedAt - pairsym !== 1)
                throw "bracket mismatch at " + i;
            else if (s[i] == "}" && stack.length == 0)
                lastCurlClosedAt = i;
        }
        else
            throw "inconsitancy in bracket pairs at " + i;
    }
    statements.push(s.slice(finishedtill, i).trim());
    var declarations = [];
    var conditionalCount = 0;
    var result = [];
    var pack = (i, t) => `void __method__${i}(){${t}}`;
    for (var i = 0; i < statements.length; i++) {
        var decl = null;
        if (statements[i].search(/^if/) > -1) {
            if (statements[i + 1]?.search(/^else/) > -1) {
                result.push(statements[i]);
            }
            else {
                result.push(pack(conditionalCount++, statements[i]));
            }
        }
        else if (statements[i].search(/^else/) > -1) {
            if (statements[i + 1]?.search(/^else/) > -1) {
                result.push(result.pop() + statements[i]);
            }
            else {
                result.push(pack(conditionalCount++, result.pop() + statements[i]));
            }
        }
        else if (statements[i].search(/^for[ ]?\(/) > -1 || statements[i].search(/^while[ ]?\(/) > -1 || statements[i].search(/do[ ]?\{/) > -1) {
            result.push(pack(conditionalCount++, statements[i]));
        }
        else if (decl = parseDeclaration(statements[i])) {
            declarations.push(decl);
            result.push(statements[i]);
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
    return { conditionalCount, statements: result, declarations };
}
exports.splitStatements = splitStatements;
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
function parseDeclaration(s) {
    var indexOfEq = s.length;
    var stack = [];
    var braces = "(){}[]";
    for (var i = 0; i < s.length; i++) {
        if (stack.length == 0 && s[i] == '=') {
            indexOfEq = i;
            break;
        }
        else {
            var matchedAt = braces.indexOf(s[i]);
            if (matchedAt == -1)
                continue;
            else if (matchedAt % 2 == 0) { //means open braces
                stack.push(s[i]);
            }
            else if (stack.length > 0) { //or closing bracket
                var pairsym = braces.indexOf(stack.pop());
                if (matchedAt - pairsym !== 1)
                    throw "bracket mismatch at " + i;
            }
            else
                throw "inconsitancy in bracket pairs at " + i;
        }
    }
    if (i == s.length)
        return null;
    else {
        var declaration = s.slice(0, indexOfEq).trim();
        var name = declaration.split(" ").pop(); //or use regex
        return { name, value: s.slice(indexOfEq + 1).trim(), declaration };
    }
}
//# sourceMappingURL=preprocess.js.map