import PouchDB from "https://cdn.skypack.dev/pouchdb@7.3.0";
import pouchdbAdapterIndexeddb from "https://cdn.skypack.dev/pouchdb-adapter-indexeddb@7.3.0";

PouchDB.plugin(pouchdbAdapterIndexeddb);

(async function (){
  const adapter = 'idb' // indexeddb, idb
  await (new PouchDB('db', {adapter})).destroy();
  let db = new PouchDB('db', {adapter});
  let response = await fetch('./test.mp4')
  const mp4blob = await response.blob()
  response = await fetch('./testa.mp3')
  const mp3blob = await response.blob()
  let doc = {_id: 'xxx'};
  const putRes = await db.put(doc);
  await db.putAttachment(doc._id, 'test.mp4', putRes.rev, mp4blob, mp4blob.type)
  doc = await db.get(doc._id)
  doc.title = 'new title'
  await db.put(doc);
  doc = await db.get(doc._id)
  doc.content = 'new content'
  doc._attachments = {
    "testa.mp3": {
      content_type: mp3blob.type,
      data: mp3blob
    }
  }
  await db.put(doc);
  doc = await db.get(doc._id)
  console.log('success', doc)
  doc = {_id: 'yyyy', _attachments: { "testmp4.mp4": {
    data: mp4blob,
    content_type: mp4blob.type
  }}}
  await db.put(doc)
  console.log('new doc', doc)
  const byTitleFn = function(doc){
    if (doc.title){
      emit(doc.title, {createDate: Date.now(), counts: { num: 1, value: 'test'}})
    }
  }
  doc = {
    _id: '_design/query_index',
    views: {
      by_title: {
        map: byTitleFn.toString()
      }
    }
  }
  await db.put(doc)
  const queryResult = await db.query('query_index/by_title')
  console.log('query result', queryResult)
  await db.close();
})()
