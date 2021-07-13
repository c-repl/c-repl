// @ts-nocheck
const express =require('express')
const repl = require('repl');
var r=require('./commandline').default
var cors = require('cors')
async function main(){
    var cli=new r
    await cli.init()
    const app=express()
    app.use(cors())
    app.use(express.json())
    app.post('/run',async function(req,res,next)
    {
        var code=req.body.code?.trim();
        try{
            var result=await cli.run(code)
            res.json(result||{class:'done'})
        }
        catch(e)
        {
            res.json(e)
        }
        // .catch((r)=>res.json(r)).then((r)=>res.json(r));
    } )
    app.listen(8000)
}
main()