const redis = require('redis');
async function connectDb() {
  
    let  client = redis.createClient({
      socket: {
        port: 6379,
        host: 'db-redis'
     }
    });
    client
      .connect()
      .then(async (res) => {
        if (client.ping()) {
          console.log('conectado a redis')
        } else {
          console.log(' error de conex')
        }
      })
      .catch((err) => {
        console.log('err happened' + err);
      });
    return client
  }

  module.exports = connectDb;