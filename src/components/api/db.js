// Initialize PouchDB
import PouchDB from 'pouchdb-browser';
import * as pouchDBFind from 'pouchdb-find';
import * as config from '../../config/db';
import { EventEmitter } from 'events';

const user = config;

PouchDB.plugin(pouchDBFind);

// enable debugging
PouchDB.debug.enable('pouchdb:find')

const db = new PouchDB('blabbr');

const dbEmitter = new EventEmitter();

db.createIndex({
  index: {
    fields: ['componentId', 'timestamp']
  }
});

db.sync(`https://${user.user}:${user.pwd}@jonathan-ec.cloudant.com/blabbr`, {
  live: true,
  retry: true
});
// .on('change', function (info) {
//   // handle change
//   dbEmitter.emit('change', info);
// }).on('paused', function (err) {
//   // replication paused (e.g. replication up to date, user went offline)
//   dbEmitter.emit('paused', err);
// }).on('active', function () {
//   // replicate resumed (e.g. new changes replicating, user went back online)
//   dbEmitter.emit('active');
// }).on('denied', function (err) {
//   // a document failed to replicate (e.g. due to permissions)
//   dbEmitter.emit('denied', err);
// }).on('complete', function (info) {
//   // handle complete
//   dbEmitter.emit('complete', info);
// }).on('error', function (err) {
//   // handle error
//   dbEmitter.emit('error', err);
// });



const dbEvents = {
  change: [],
  paused: [],
  active: [],
  denied: [],
  complete: [],
  error: []
};

dbEmitter.on('change', (data) => {
  let changedDoc,
    componentId,
    stateId,
    eventData;

  // fire any listeners passing through data
  for (let i = 0, l = dbEvents.change.length; i < l; i++) {
    changedDoc = data.doc;
    eventData = dbEvents.change[i];

    if (eventData.eventName === changedDoc.eventName &&
      eventData.listener) {
      eventData.listener(data);
    }
  }
});

// TODO - add other event types to listen e.g. paused etc.

const subscribe = (eventType, eventName, listener) => {
  if (!dbEvents[eventType]) {
    return "No such event type, plesae use 'change'/'active'/'denied'/'complete'/'error'";
  }
  let eventId = `${eventType}${eventName}`;

  let eventListener = db.changes({
    since: 'now',
    live: true,
    include_docs: true,
    filter: function (doc) {
      return doc.eventName === eventName;
    }
  }).on('change', (data) => {
    dbEmitter.emit('change', data);
  }).on('error', (err) => {
    dbEmitter.emit('error', err);
  });

  dbEvents[eventType].push({ "eventId": eventId, eventListener, eventName, listener });

  // unique id returned
  return eventId;
};

const unsubscribe = (eventType, eventId) => {
  if (!dbEvents[eventType]) {
    return "No such event type, plesae use 'change'/'active'/'denied'/'complete'/'error'";
  }
  let eventRemoved = false;

  if (dbEvents[eventType]) {
    for (let i = 0, l = dbEvents[eventType].length; i < l; i++) {
      if (dbEvents[eventType][i].eventId === eventId) {
        dbEvents[eventType][i].eventListener && dbEvents[eventType][i].eventListener.cancel();
        dbEvents[eventType].splice(i, 1);
        eventRemoved = true;
        break;
      }
    }
  }
  return eventRemoved;
};

export const dbEventManager = {
  subscribe,
  unsubscribe
};

export default db;
