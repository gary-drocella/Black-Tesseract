# Black Tesseract

**Black TesseracT** is a scalable and distributed RAM based inverted index NoSQL Database


## Features

- Automatic node discovery using IGMP
-   Remote procedure calls to perform various queries on the nodes.
-   As many master nodes and data nodes as your heart desires.
-   CRUD query operations.
-   Bulk query operations.
-   Local RAM Inverted Index operations
-   Distributed Inverted Index operations
-   REST API to allow applications to perform queries on the master nodes.
-   Round-robin sharding of documents into the nodes.

## TODO

-   Add automated regression tests!
-   Add fuzzy query operation feature
-   Add LFU cache policy feature
-   Add graceful shutdown
-   Add puppet script to perform automatic configuration of the VMs for integration testing.
-   And more features as I think of them.


 
## Starting Black TesseracT

1. Install Node.js if you haven't already.
2. Install NPM (Node Package Manager) if you haven't already.
3. Go to the root of the project and run the following command:
	`$ npm install`
4. To start Black TesseracT, run the following command:
	`$ node index.js`
	
## Black TesseracT Configuration

The configuration is located in black-tesseract.js file.  Here is the sample:

```
exports.config = {
	tokenizer :  "en",
	cluster : {
		node : {
			roles: [
				"master",
				"data"
			]
		},
		networkInterface:  "127.0.0.1",
		port:  44600
	},
	// LFU Cache Policy is not implemented yet...
	cache : {
		policy :  "LFU",
		maxSize :  1000,
	}
}
```

The tokenizer is set to en.  This informs Black TesseracT to tokenize the English language.

The cluster attribute configures that nodes, network interface, and cluster port.  In this particular configuration, this node has two roles; that is, it's a master and data node.  The network interface is configured to use localhost.  The default port the node will bind to is 44600.

The cache attribute will configure the cache size and policy the node will use.  (Note: This is not implemented yet.)

## Supported Query Operations

- create index
- insert document
- simple search
- update document
- delete document
- bulk insert documents
- bulk update documents
- bulk delete documents
- index size

## Query the REST API

Creating an index called twitter:

```
curl -XPOST http://localhost:8085/create_index/twitter
{"_success":true,"_created_index":true}
```

Inserting a document into the twitter index:

```
curl -XPOST http://localhost:8085/insert/twitter/1 -H "Content-Type: application/json" --data '{"_insert" : {"_text" : "the quick brown fox jumped over the lazy dog", "url" : "http://twitter.com" } }'
{
  "_success": true,
  "_inserted": {
    "_id": "1",
    "_document": {
      "_text": "the quick brown fox jumped over the lazy dog",
      "url": "http://twitter.com"
    },
    "_index": "twitter"
  }
}
```

Performing a simple search on the twitter index:

```
curl -XGET "http://localhost:8085/search/twitter?q=dog"
{
  "_success": true,
  "_documents": [
    {
      "_id": "1",
      "_document": {
        "_text": "the quick brown fox jumped over the lazy dog",
        "url": "http://twitter.com"
      },
      "_index": "twitter",
      "_boolean_score": 1
    }
  ],
  "_count": 1
}
```

Performing an update on a document in the twitter index with id 1.

```
curl -XPOST http://localhost:8085/update/twitter/1 -H "Content-Type: application/json" --data '{"_update" : { "_text" : "apple pi"} }'
{
  "_success": true,
  "_update_count": 1,
  "_original_document": {
    "_index": "twitter",
    "_id": "1",
    "_document": {
      "_text": "the quick brown fox jumped over the lazy dog",
      "url": "http://twitter.com"
    }
  }
}
```

Deleting a document from the twitter index with id 1.

```
curl -XDELETE http://localhost:8085/twitter/1
{
  "_success": true,
  "_delete_count": 1,
  "_deleted": {
    "_index": "twitter",
    "_id": "1",
    "_document": {
      "_text": "apple pi"
    }
  }
}
```

Bulk inserting documents into the twitter index:

```
curl -XPOST http://localhost:8085/bulk_insert/twitter -H "Content-Type: application/json" --data '{"_bulk_insert_documents" : [{ "_insert" : {"_text" : "applie pie"}, "_id" : 1}, {"_insert": {"_text": "pumpkin pie"}, "_id": 2 }] }'
{
  "_success": true,
  "_bulk_inserted": [
    {
      "_id": 1,
      "_document": {
        "_text": "applie pie"
      },
      "_index": "twitter"
    },
    {
      "_id": 2,
      "_document": {
        "_text": "pumpkin pie"
      },
      "_index": "twitter"
    }
  ],
  "_count": 2,
  "_failed_count": 0,
  "_failed_documents": []
}
```

Bulk updating documents in the twitter index:

```
curl -XPOST http://localhost:8085/bulk_update/twitter -H "Content-Type: application/json" --data '{"_bulk_update_documents" : [{ "_update" : {"_text" : "hello world"}, "_id" : 1}, {"_update": {"_text": "goodbye world"}, "_id": 2 }] }'
{
  "_success": true,
  "_bulk_updated": [
    {
      "_original_document": {
        "_index": "twitter",
        "_id": 1,
        "_document": {
          "_text": "applie pie"
        }
      }
    },
    {
      "_original_document": {
        "_index": "twitter",
        "_id": 2,
        "_document": {
          "_text": "pumpkin pie"
        }
      }
    }
  ],
  "_update_count": 2
}
```

Bulk deleting documents from the twitter index:

```
curl -XDELETE http://localhost:8085/bulk_delete/twitter -H "Content-Type: application/json" --data '{"_bulk_delete_documents" : [{ "_delete" : { "_id" : 1}}, {"_delete": { "_id": 2 }}]}'
{
  "_success": true,
  "_bulk_deleted": [
    {
      "_index": "twitter",
      "_document": {
        "_text": "applie pie"
      },
      "_id": 1
    },
    {
      "_index": "twitter",
      "_document": {
        "_text": "pumpkin pie"
      },
      "_id": 2
    }
  ],
  "_delete_count": 2
}
```

Getting the size of the twitter index:

```
curl -XGET "http://localhost:8085/size/twitter"
{"_success":true,"_size":2}