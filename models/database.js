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
				store.createIndex("readAtIndex", "read_at", { unique: false}); 
				store.createIndex("unreadAtIndex", "unread_at", { unique: false}); 
				store.createIndex("starredAtIndex", "starred_at", { unique: false}); 
				next();
            }
        },
		// {
		// 	version: "0.0.4",
		// 	migrate: function(db, versionRequest, next) {
		// 		var store = versionRequest.transaction.objectStore("messages")
		// 		store.createIndex("hostIndex", "host", { unique: false}); 
		// 		store.createIndex("sourceIndex", "source", { unique: false}); 
		// 		next();
		// 	}
		// }
    ]
}