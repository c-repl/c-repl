// @ts-nocheck
const express =require('express')
const sessions=new Map;
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
      cookie: { secure: false }
    }))
    app.use(cors())
    app.use(express.json())
    app.post('/run',async function(req,res,next){
        console.log(req.session)
        if (!('cli' in req.session))
        { 
            var id=Math.random()
            req.session.cli=id;
            var cli=new r;
            await cli.init()
            sessions.set(id,cli)
            console.log('new initialized')
        }
        else console.log('old session')
        next()

    },async function(req,res,next)
    {
        var code=req.body.code?.trim();    
        console.log('code',code,sessions.get(req.session.cli).run)
        try{
            var result=await sessions.get(req.session.cli).run(code)
            console.log('result',result)
            res.json(result||{class:'done'})
        }
        catch(e)
        {
            res.json(e)
            console.error(e)
        }
        // .catch((r)=>res.json(r)).then((r)=>res.json(r));
    } )
    app.listen(8000)
}
main()