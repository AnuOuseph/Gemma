const { MongoClient } = require('mongodb-legacy');
const state={
    db:null
}

module.exports.connect=(done)=>{
    const url = "mongodb://localhost:27017";
    const dbname = 'shopping';

    MongoClient.connect(url,(err,data)=>{          //connecting to mongodb
        if(err) return console.log(err)
        state.db=data.db(dbname);

        done();
    })
}

module.exports.get=()=> state.db; 