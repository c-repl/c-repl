// @ts-nocheck
const express =require('express')
const repl = require('repl');
var session = require('express-session')
var r=require('./commandline').default
var cors = require('cors')
async function main(){
    const app=express()
    app.set('trust proxy', 1) // trust first proxy
    app.use(session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: true }
    }))
    app.use(cors())
    app.use(express.json())
    app.post('/run',async function(req,res,next){
        if (!('cli' in req.session))
        { req.session.cli=new r;
            await req.session.cli.init()
            console.log('new initialized')
        }
        else console.log('old session')
        next()

    },async function(req,res,next)
    {
        var code=req.body.code?.trim();
        try{
            var result=await req.session.cli.run(code)
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