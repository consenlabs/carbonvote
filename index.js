const config = require('config')
const redis = require('redis').createClient(config.dbConfig)
