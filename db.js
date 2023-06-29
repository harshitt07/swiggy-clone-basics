const { MongoClient } = require('mongodb');

let dbConnection;

// module.exports = {
//     connectToDb: (cb) => { // cb is a type of function
//         MongoClient.connect('mongodb+srv://ppa:ppaproject@swiggy-clone.mrrlfe0.mongodb.net/?retryWrites=true&w=majority')
//         .then((client) => {
//             dbConnection = client.db('swiggy-clone');
//             cb();
//         })
//         .catch(err => {
//             console.log(err);
//             cb(err);
//         })
//     },
//     getDb: () => {
//         return dbConnection;
//     }
// }

module.exports = {
    connectToDb: () => { // cb is a type of function
        MongoClient.connect('mongodb+srv://ppa:ppaproject@swiggy-clone.mrrlfe0.mongodb.net/?retryWrites=true&w=majority')
        .then((client) => {
            dbConnection = client.db('swiggy-clone');
            return dbConnection;
        })
        .catch(err => {
            console.log(err);
            throw err;
        })
    },
    getDb: () => {
        return dbConnection;
    }
}