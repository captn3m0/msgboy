var msgboyDatabase = {
    id: "msgboy-database",
    description: "The database for the msgboy",
    migrations : [
        {
            version: "0.0.1",
            migrate: function(db, versionRequest, next) {
                db.createObjectStore("messages"); 
                db.createObjectStore("inbox"); 
                next();
            }
        },
		{
            version: "0.0.2",
            migrate: function(db, versionRequest, next) {
				var store = versionRequest.transaction.objectStore("messages")
				store.createIndex("createdAtIndex", "created_at", { unique: false}); 
				next();
            }
        },
		{
            version: "0.0.3",
            migrate: function(db, versionRequest, next) {
				var store = versionRequest.transaction.objectStore("messages")
				store.createIndex("readIndex", "read_at", { unique: false}); 
				store.createIndex("starredIndex", "starred_at", { unique: false}); 
				next();
            }
        },

    ]
}