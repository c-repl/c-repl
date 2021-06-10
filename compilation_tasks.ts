// import { sFile } from "./compiler";

// async function compile(code: sFile, pp = false, target: (aFile | oFile | soFile)["type"] = "afile") {
//     if (typeof code != 'string') {
//         var lib = "lib" in code ? code.lib : [];
//         code = "text" in code ? code.text : code;
//     }
//     if (target == 'ofile') return codetoo(code, pp)
//     else if (target == 'sofile') return codetoso(code, pp)
//     else if (target == 'afile') return makeExecObject([await codetoo(code, pp)], lib)
//     else throw "illegal compilation target"
// }
// function run