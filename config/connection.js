const MongoClient = require('mongodb').MongoClient
const state ={
    db:null
}

module.exports.connect= (done)=>{
    const url = 'mongodb+srv://shamil:mohamedsha@cluster0.3inwcui.mongodb.net/test'
    const dbname = 'ecommerce'


    MongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db = data.db(dbname)
        done()
    })
}

module.exports.get = function(){
    return state.db 
}