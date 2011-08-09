var msgboyDatabase = {
    functions: {
        eachBlock: function (a, i, d) {
            var e = a.pop();
            if (e) {
                i(e, function () {
                    msgboyDatabase.functions.eachBlock(a, i, d);
                });
            } else {
                d();
            }
        }
    },
    id: "msgboy-database",
    description: "The database for the msgboy",
    migrations: [{
        version: "0.0.1",
        migrate: function (db, versionRequest, next) {
            db.createObjectStore("messages");
            db.createObjectStore("inbox");
            next();
        }
    }, {
        version: "0.0.2",
        migrate: function (db, versionRequest, next) {
            var store = versionRequest.transaction.objectStore("messages");
            store.createIndex("createdAtIndex", "created_at", {
                unique: false
            });
            next();
        }
    }, {
        version: "0.0.3",
        migrate: function (db, versionRequest, next) {
            var store = versionRequest.transaction.objectStore("messages");
            store.createIndex("readAtIndex", "read_at", {
                unique: false
            });
            store.createIndex("unreadAtIndex", "unread_at", {
                unique: false
            });
            store.createIndex("starredAtIndex", "starred_at", {
                unique: false
            });
            next();
        }
    }, {
        version: "0.0.4",
        migrate: function (db, versionRequest, next) {
            var store = db.createObjectStore("feeds");
            store.createIndex("urlIndex", "url", {
                unique: false
            });
            next();
        }
    }, {
        version: "0.0.5",
        migrate: function (db, versionRequest, next) {
            var store = versionRequest.transaction.objectStore("messages");
            store.createIndex("alternateIndex", "alternate", {
                unique: false
            });
            store.createIndex("hostIndex", "host", {
                unique: false
            });
            next();
        },
        before: function (db, next) {
            var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
            var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction; // No prefix in moz
            var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange; // No prefix in moz
            // We need to add the missing fields, on the host, and the feed's alternate url.
            var transaction = db.transaction(["messages"], IDBTransaction.READ_ONLY);
            var store = transaction.objectStore("messages");
            var cursor = store.openCursor();
            var messages_to_save = [];
            cursor.onsuccess = function (e) {
                cursor = e.target.result;
                if (cursor) {
                    if (typeof (cursor.value.host) === "undefined" || typeof (cursor.value.alternate) === "undefined" || !cursor.value.host || !cursor.value.alternate) {
                        messages_to_save.push(cursor.value);
                    }
                    cursor._continue();
                }
            };
            transaction.oncomplete = function () {
                msgboyDatabase.functions.eachBlock(messages_to_save, function (message, next) {
                    var writeTransaction = db.transaction(["messages"], IDBTransaction.READ_WRITE);
                    var store = writeTransaction.objectStore("messages");
                    message.host = "";
                    message.alternate = "";
                    var writeRequest = store.put(message, message.id);
                    writeRequest.onerror = function (e) {
                        console.log("There was an error. Migration will fail. Plese reload browser.");
                        next();
                    };
                    writeRequest.onsuccess = function (e) {
                        next();
                    };
                }, function () {
                    next();
                });
            };
        }
    }, {
        version: "0.0.6",
        migrate: function (db, versionRequest, next) {
            var store = versionRequest.transaction.objectStore("messages");
            store.createIndex("alternateNewIndex", "alternate_new", {
                unique: false
            });
            next();
        },
        before: function (db, next) {
            var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
            var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction; // No prefix in moz
            var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange; // No prefix in moz
            // We need to add the missing fields, on the host, and the feed's alternate url.
            var transaction = db.transaction(["messages"], IDBTransaction.READ_ONLY);
            var store = transaction.objectStore("messages");
            var cursor = store.openCursor();
            var messages_to_save = [];
            cursor.onsuccess = function (e) {
                cursor = e.target.result;
                if (cursor) {
                    if (typeof (cursor.value.alternate_new) === "undefined" || !cursor.value.alternate_new) {
                        messages_to_save.push(cursor.value);
                    }
                    cursor._continue();
                }
            };
            transaction.oncomplete = function () {
                msgboyDatabase.functions.eachBlock(messages_to_save, function (message, next) {
                    var writeTransaction = db.transaction(["messages"], IDBTransaction.READ_WRITE);
                    var store = writeTransaction.objectStore("messages");
                    message.alternate_new = "";
                    var writeRequest = store.put(message, message.id);
                    writeRequest.onerror = function (e) {
                        console.log("There was an error. Migration will fail. Plese reload browser.");
                        next();
                    };
                    writeRequest.onsuccess = function (e) {
                        next();
                    };
                }, function () {
                    next();
                });
            };
        }
    }, {
        version: "0.0.7",
        migrate: function (db, versionRequest, next) {
            var store = versionRequest.transaction.objectStore("messages");
            store.createIndex("stateIndex", "state", {
                unique: false
            });
            next();
        },
        before: function (db, next) {
            var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
            var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction; // No prefix in moz
            var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange; // No prefix in moz
            var transaction = db.transaction(["messages"], IDBTransaction.READ_ONLY);
            var store = transaction.objectStore("messages");
            var cursor = store.openCursor();
            var messages_to_save = [];
            cursor.onsuccess = function (e) {
                cursor = e.target.result;
                if (cursor) {
                    if (typeof (cursor.value.state) === "undefined" || !cursor.value.state) {
                        messages_to_save.push(cursor.value);
                    }
                    cursor._continue();
                }
            };
            transaction.oncomplete = function () {
                msgboyDatabase.functions.eachBlock(messages_to_save, function (message, next) {
                    var writeTransaction = db.transaction(["messages"], IDBTransaction.READ_WRITE);
                    var store = writeTransaction.objectStore("messages");
                    message.state = "new";
                    var writeRequest = store.put(message, message.id);
                    writeRequest.onerror = function (e) {
                        console.log("There was an error. Migration will fail. Plese reload browser.");
                        next();
                    };
                    writeRequest.onsuccess = function (e) {
                        next();
                    };
                }, function () {
                    next();
                });
            };
        }
    }, {
        version: "0.0.8",
        migrate: function (db, versionRequest, next) {
            var store = versionRequest.transaction.objectStore("messages");
            store.createIndex("feedIndex", "feed", {
                unique: false
            });
            next();
        },
        before: function (db, next) {
            var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
            var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction; // No prefix in moz
            var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange; // No prefix in moz
            var transaction = db.transaction(["messages"], IDBTransaction.READ_ONLY);
            var store = transaction.objectStore("messages");
            var cursor = store.openCursor();
            var messages_to_save = [];
            cursor.onsuccess = function (e) {
                cursor = e.target.result;
                if (cursor) {
                    if (typeof (cursor.value.feed) === "undefined" || !cursor.value.feed) {
                        messages_to_save.push(cursor.value);
                    }
                    cursor._continue();
                }
            };
            transaction.oncomplete = function () {
                msgboyDatabase.functions.eachBlock(messages_to_save, function (message, next) {
                    var writeTransaction = db.transaction(["messages"], IDBTransaction.READ_WRITE);
                    var store = writeTransaction.objectStore("messages");
                    message.feed = message.source.url;
                    var writeRequest = store.put(message, message.id);
                    writeRequest.onerror = function (e) {
                        console.log("There was an error. Migration will fail. Plese reload browser.");
                        next();
                    };
                    writeRequest.onsuccess = function (e) {
                        next();
                    };
                }, function () {
                    next();
                });
            };
        }
    }, {
        version: "0.0.9",
        migrate: function (db, versionRequest, next) {
            var subscriptions = db.createObjectStore("subscriptions");
            subscriptions.createIndex("stateIndex", "state", {unique: false});
            subscriptions.createIndex("subscribedAtIndex", "subscribed_at", {unique: false});
            subscriptions.createIndex("unsubscribedAtIndex", "unsubscribed_at", {unique: false});
            next();
        }
    }]
};