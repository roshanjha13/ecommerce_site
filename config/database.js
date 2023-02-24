const mongoose = require('mongoose');

const connectDatabase = () => {
    mongoose.set('strictQuery', true)
    mongoose.connect(process.env.DB_URL).then((data) => {
        console.log(`MOngodb connected with server : ${data.connection.host}`);
    })
}

module.exports = connectDatabase