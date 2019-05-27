const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const _ = require('lodash');
const adapter = new FileSync('./db/db.json');
const db = low(adapter);

const TABLES = {
  PRIDICT: 'predict',
}

db.defaults({
  [TABLES.PRIDICT]: [],
}).write()

module.exports.savePredict = (data) => {
  db.get(TABLES.PRIDICT)
    .push(data)
    .write();
}

module.exports.getPredict = (playerId) => {
  return db.get(TABLES.PRIDICT)
    .filter(p => p.playerId === playerId)
    .value()
    .pop();
}