# C-Repl

Root module for C-repl

## CLI usage
```bash
$   npm run repl
c++ > |
```
## Web Cli usage
```bash
$ npm run server
# goto http://<server-domain/ip>:8000
```
## Dependecy chart
```bash
First Party Dependency
c-rpl@1.0.0 ~/c-repl (https://github.com/c-repl/c-repl)
├── talk-to-gdb@1.0.0 (https://github.com/yniks/talk-to-gdb.git)
├── cpp-meta-data@1.0.0 (https://github.com/yniks/cpp-meta-data.git)
└── gdb-parser-extended@1.0.0 (https://github.com/yniks/gdb-parser-extended.git)
 
Other Dependency
c-rpl@1.0.0 ~/c-repl  (https://github.com/c-repl/c-repl)
├── @types/node@14.14.0
├── @types/tmp@0.2.0
├── chalk@3.0.0
├── cors@2.8.5
├── execa@4.0.3
├── express@4.17.1
├── nodemon@2.0.6
├── tmp@0.2.1
├── type-fest@0.16.0
├── typedoc-plugin-mermaid@1.3.0
├── typedoc@0.11.1
├── typescript@4.2.4
└── util-promisifyall@1.0.6

```

## DEMO CODE
```javascript
var r=require('./js/commandline').default

var cli=new r
await cli.init()
//evaluting any expression in the context of runnign program



await cli.run("1+1+1+1");
//  value: '4',



//adding symbols to the running program viadyanmic linking
await cli.compile("int add(int a,int b){return a+b;}")
await cli.compile(`char* myname(){return "dew";}`)

await cli.evaluate("add")
// value: '{int (int, int)} 0x7ffff7fc90f5 <add(int, int)>',




await cli.compile("int anothersym=231;")
await cli.evaluate("add(anothersym,100)")
//  value: '331',
await cli.evaluate("myname()")
  //value: '0x7ffff7fc5000 "dew"',
//each defined symbol is being compiled into a a shared object file, and then being dynammically linked into the program via dlopen


/////////// working
//  compiling non-expression sourcecode to shared object files, and then linking them to the running program, via dlopen.
// -rdyanamic flag is being used during compiling, so all new coming objects are able to 'see' old symbols which were defined by user previosly
// all the symbols defined in a unit being compiled will be included in all the upcoming compilation file (e.g when a user declares a function such as int add(), its prototype will be extracted  to a header file which is being included in every upcoming compilatio tasks)
// for dynamically creating headers for a source cplusplus file, cpp preprocessor(cpp.exe) and gdb are  being used
// .
//.


/**
 * TASKS:
 *  CLI USER INTERFACE
 *  maybe WEB INTERFACE
 *  PORT TO WINDOWS, currently linux only
 *  
 * */ 
/**idea*
 * 

1.The idea is to create a REPL shell for c++/c. Using this CLI, user can run C++  like they run python or js in terminal. i.e. 
One expression at a time. No need to build complete program to test a little expression, or to rebuild after a little tweak. Work as if C++ is being interpreted and not being compiled. 
2. Directly call windows or linux library functions from shell, so need to install a full python package just to call mouse.move(x,y), which can be called directly from shell. Load , try and test any dll or shared libraries on the go.

3. Hook into any runnning or stored program  or object file and use those functions directly from terminal

*/
```
