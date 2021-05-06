"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.getname = void 0;
const crypto_1 = require("crypto");
const path_1 = __importDefault(require("path"));
const source_1 = require("./source");
const md5sum = crypto_1.createHash('md5');
function getname(filenames) {
    if (typeof filenames == 'string')
        return path_1.default.join(source_1.tmpdir.name, filenames);
    return path_1.default.join(source_1.tmpdir.name, md5sum.copy().update(filenames.sort().join("")).digest('hex'));
}
exports.getname = getname;
exports.options = ["-fno-eliminate-unused-debug-types", "-g3", "-O0", "-rdynamic"];
//# sourceMappingURL=util.js.map