const { MongoClient } = require('mongodb-legacy');

const state={
    db:null
}

module.exports.connect=(done)=>{
    const url = process.env.MONGODB_URL
    const dbname = 'shopping';

    MongoClient.connect(url,(err,data)=>{  
        if(err) return console.log(err)
        state.db=data.db(dbname);

        done();
    })
}

module.exports.get=()=> state.db; 