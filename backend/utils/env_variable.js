require('dotenv').config()

const SECRET_KEY = process.env.SECRET_KEY
const MONGODB_URI = process.env.MONGODB_URI

module.exports = {SECRET_KEY, MONGODB_URI}