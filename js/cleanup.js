"use strict";
exports.Cleanup = function Cleanup(callback) {
    callback = callback || (() => { });
    process.on('cleanup', callback);
    process.on('exit', function () {
        process.emit('cleanup');
    });
    process.on('SIGINT', function () {
        console.log('Ctrl-C...');
        process.exit(2);
    });
    process.on('uncaughtException', function (e) {
        console.log('Uncaught Exception...');
        console.log(e.stack);
        process.exit(99);
    });
};
//# sourceMappingURL=cleanup.js.map