const config = require('config')
const db = require('redis').createClient(config.dbConfig)
const nodeModel = require('./lib/node')

const node = new nodeModel(db)
node.hello()
