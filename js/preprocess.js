"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitStatements = exports.pretty = exports.cpp = exports.preProcess = void 0;
const execa_1 = __importDefault(require("execa"));
async function preProcess(code) {
    return (await splitStatements(await cpp(await pretty(code)))).statements.join('\n');
}
exports.preProcess = preProcess;
// export async getMacros()
// {
// }
async function cpp(code) {
    var e = execa_1.default("cpp", ["-P"]);
    await e.stdin?.write(code);
    await e.stdin?.end();
    return (await e).stdout;
}
exports.cpp = cpp;
async function pretty(code) {
    var e = execa_1.default("clang-format");
    await e.stdin?.write(code);
    await e.stdin?.end();
    return (await e).stdout;
}
exports.pretty = pretty;
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
    var pack = (i, t) => `void __method__${i}() {\n${t}}; static int __variable__${i} = __method__${i}();`;
    for (var i = 0; i < statements.length; i++) {
        if (statements[i].search(/^if/) > -1) { //if
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
        else if (statements[i].search(/^try/) > -1) { //try-catch
            if (statements[i + 1]?.search(/^catch/) > -1) {
                result.push(statements[i]);
            }
            else {
                result.push(pack(conditionalCount++, statements[i]));
            }
        }
        else if (statements[i].search(/^catch/) > -1) {
            if (statements[i + 1]?.search(/^catch/) > -1) {
                result.push(result.pop() + statements[i]);
            }
            else {
                var t = result.pop();
                if (t && t.startsWith('try'))
                    result.push(pack(conditionalCount++, t + statements[i]));
                else
                    result.push(t + statements[i]);
            }
        }
        else if (statements[i].search(/^for[ ]?\(/) > -1 || statements[i].search(/^while[ ]?\(/) > -1 || statements[i].search(/do[ ]?\{/) > -1) {
            result.push(pack(conditionalCount++, statements[i]));
        }
        else
            result.push(statements[i]);
    }
    return { conditionalCount, statements: result, declarations };
}
exports.splitStatements = splitStatements;
function getDeclaration(s) {
    if (s.search(/^(class|struct|typedef|if|try|for|while|do|switch|extern)/) == 0)
        return s;
    var stack = [];
    var braces = "(){}[]<>";
    var suredecl = 0;
    for (var i = 0; i < s.length; i++) {
        if (stack.length == 0) {
            if (s[i] == " ")
                if (++suredecl == 2)
                    if (s[i + 1] == "=" || s[i + 1] == '{' || s[i + 1] == ';')
                        return "extern " + s.slice(0, i) + ";";
                    else
                        return "";
        }
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
    return stack.length == 0 ? "extern " + s.slice(0, i) : "";
}
//# sourceMappingURL=preprocess.js.map