/**
 * Black TesseracT is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Black TesseracT is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Black TesseracT.  If not, see <https://www.gnu.org/licenses/>.
 */

const ConfigConstants = require("./const/config-constants");
const ResultDocumentConstants = require('./const/result-document-constants');
const QueryDocumentConstants = require('./const/query-document-constants');

const QueryParser = require("./query-parser");
const config = require("../black-tesseract").config;
const Tokenizer = require('./tokenizer');
const crypto = require("crypto");
const winston = require('winston');
const _ = require("lodash");

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = class RAMBasedInvertedIndex {
    //TODO: Add the Tokenizer to the configuration file.
    constructor() {
        this.ramDb = {};
        this.index = {};
        this.tokenizer = config[ConfigConstants.TOKENIZER];
    }

    createIndex(index) {
        let ret = {};
        ret[ResultDocumentConstants.SUCCESS] = true;

        logger.info("Creating index [" + index + "]...");

        if(!(index in this.ramDb)) {
            this.ramDb[index] = {};
            ret[ResultDocumentConstants.CREATED_INDEX] = true;
        }
        else {
            ret[ResultDocumentConstants.CREATED_INDEX] = false;
        }

        return ret;
    }

    insertDocument(dbIndex, document, id) {
        let ret = {};
        id = id + ""
        
        logger.info("Inserting document into index [" + dbIndex + "]");

        if(!dbIndex) {
            logger.error("Invalid Index");
            ret[ResultDocumentConstants.SUCCESS] = false;
            ret[ResultDocumentConstants.MESSAGE] = "Index is required.";
            return ret;
        }

        if(!document[QueryDocumentConstants.INSERT][QueryDocumentConstants.TEXT]) {
            logger.error("Document is missing _text attribute.");
            ret[ResultDocumentConstants.SUCCESS] = false;
            ret[ResultDocumentConstants.MESSAGE] = "Document is missing _text attribute.";
            return ret;
        }

        if(!id) {
            let hash = crypto.createHash("sha512");
            id = hash.update(this.idRandomizer++ + document, "UTF-32").digest("hex");
        }

        if(this.indexExists(dbIndex)[ResultDocumentConstants.EXISTS]) {
            if(this.idExists(dbIndex, id)[ResultDocumentConstants.ID_EXISTS]) {
                ret[ResultDocumentConstants.SUCCESS] = false;
                ret[ResultDocumentConstants.MESSAGE] = "Id exists in the database.";
                return ret;
            }
        }

        let indexExisted = this.indexExists(dbIndex);


        this.insertDocIntoRAMDb(dbIndex, id, document);

        if(!indexExisted) {
            ret[ResultDocumentConstants.CREATED_INDEX] = true;
        }

        let tokenizer = new Tokenizer();
        let data = tokenizer.tokenize(document[QueryDocumentConstants.INSERT][QueryDocumentConstants.TEXT]);

        for(let i = 0; i < data.length; i++) {
            let term = data[i].toLowerCase();
            let docIds = this.index[term];

            if(!docIds) {
                this.index[term] = [];
            }

            this.index[term].push(id);
        }
        let insertedDoc = {};

        insertedDoc[ResultDocumentConstants.ID] = id;
        insertedDoc[ResultDocumentConstants.DOCUMENT] = document[QueryDocumentConstants.INSERT];
        insertedDoc[ResultDocumentConstants.INDEX] = dbIndex;

        ret[ResultDocumentConstants.SUCCESS] = true;
        ret[ResultDocumentConstants.INSERT] = insertedDoc;

        return ret;
    }

    simpleSearch(index, query) {
        let queryParser = new QueryParser();
        let qTerms = queryParser.parse(query);
        let resDocs = [];
        let ret = {};

        logger.info("Performing a simple search on index [" + index + "] with query [" + query + "]");

        if(!this.indexExists(index)) {
            logger.error("Index Does Not Exist");
            ret[ResultDocumentConstants.SUCCESS] = false;

            return ret;
        }

        let resultDocIds = [];
        for(let i = 0; i < qTerms.length; i++) {
            let docIds = this.index[qTerms[i].toLowerCase()];

            if(!docIds) {
                continue;
            }

            for(let j = 0; j < docIds.length; j++) {
                let docId = docIds[j];

                if(!resultDocIds.includes(docId)) {
                    let result = {};
                    let document = this.ramDb[index][docId];
    
                    result[ResultDocumentConstants.ID] = docId;
                    result[ResultDocumentConstants.DOCUMENT] = document;
                    result[ResultDocumentConstants.INDEX] = index;
                    result[ResultDocumentConstants.BOOLEAN_SCORE] = 1;
                    
                    resDocs.push(result);
                    resultDocIds.push(docId);
                }
            }
        }

        ret[ResultDocumentConstants.SUCCESS] = true;
        ret[ResultDocumentConstants.COUNT] = resDocs.length;
        ret[ResultDocumentConstants.DOCUMENTS] = resDocs;

        return ret;
    }

    filterWordsFromQuery(qTerms) {
        for(let i = 0; i < qTerms; i++) {
            let currTerm = qTerms[i];

            /**
             * TODO: Finish implementing...
             */
        }
    }

    insertDocIntoRAMDb(dbIndex, id, document) {
        if(!this.indexExists(dbIndex)[ResultDocumentConstants.EXISTS]) {
            this.ramDb[dbIndex] = {};                
        }

        this.ramDb[dbIndex][id] = document[QueryDocumentConstants.INSERT];
    }

    indexExists(index) {
        let ret = {};
        ret[ResultDocumentConstants.SUCCESS] = true;
        ret[ResultDocumentConstants.EXISTS] = index in this.ramDb;

        return ret;
    }

    bulkInsert(index, documents) {
        let ret = {};

        if(!documents) {
            logger.error("There are no documents to insert.");
            return this.unsuccessfulInsert("There are no documents to insert.");
        }

        let success = [];
        let insertCount = 0;
        let indexExisted = this.indexExists(index);
        let failedCount = 0;
        let failed = [];

        for(let i = 0; i < documents.length; i++) {
            let currDoc = documents[i][QueryDocumentConstants.INSERT];
            let currId = documents[i][QueryDocumentConstants.ID];

            if(!currDoc) {
                logger.error("Invalid bulk insert query.");
                return this.unsuccessfulInsert("Invalid bulk insert query.");
            }

            let res = this.insertDocument(index, currDoc, currId);
            let isSuccess = res[ResultDocumentConstants.SUCCESS];

            if(isSuccess) {
                success.push(res[ResultDocumentConstants.INSERT]);
                insertCount++;
            }
            else {
                failed.push(currDoc)
                failedCount++;
            }
        }

        ret[ResultDocumentConstants.SUCCESS] = true;
        ret[ResultDocumentConstants.INSERT_COUNT] = insertCount;
        ret[ResultDocumentConstants.BULK_INSERT] = success;
        ret[ResultDocumentConstants.FAILED_DOCUMENTS] = failed;
        ret[ResultDocumentConstants.FAILED_COUNT] = failedCount;

        if(!indexExisted) {
            ret[ResultDocumentConstants.CREATED_INDEX] = true;
        }
        
        return ret;
    }

    size(index) {
        let size = 0;
        let ret = {};

        if(index) {
            if(!this.indexExists(index)) {
                logger.error("Index does not exist.");
                ret[ResultDocumentConstants.SUCCESS] = false;
                ret[ResultDocumentConstants.MESSAGE] = "Index does not exist.";

                return ret;
            }

            size = _.size(this.ramDb[index]);
        }
        else {
            let currIndexSize = 0;
            for(k in this.ramDb) {
                currIndexSize = _.size(this.ramDb[k]);
                size += currIndexSize;
            }
        }

        ret[ResultDocumentConstants.SUCCESS] = true;
        ret[ResultDocumentConstants.SIZE] = size;

        if(index) {
            ret[ResultDocumentConstants.INDEX] = index;
        }

        return ret;
    }

    deleteDocument(index, id) {
        id = id + ""

        logger.info("Deleting document with id [" + id + "] from index [" + index + "]");
        let ret = {};

        if(!index) {
            logger.error("Index Is Undefined");
            return this.unsuccessfulDelete("Index is undefined.");
        }

        if(!id) {
            logger.error("Id is Undefined");
            return this.unsuccessfulDelete("Id is undefined.");
        }

        if(!this.indexExists(index)[ResultDocumentConstants.EXISTS]) {
            logger.error("Index Does Not Exist");
            return this.unsuccessfulDelete("Index does not exist.");
        }

        if(!this.idExists(index, id)[ResultDocumentConstants.ID_EXISTS]) {
            logger.error("Id Does Not Exist");
            return this.unsuccessfulDelete("Id does not exist for index.");
        }

        let document = this.ramDb[index][id];
        let tokenizer = new Tokenizer();
        let data = tokenizer.tokenize(document[QueryDocumentConstants.TEXT]);

        for(let i = 0; i < data.length; i++) {
            let term = data[i].toLowerCase();
            let docIds = this.index[term];

            if(!docIds) {
                continue;
            }
            
            let docIdIndex = docIds.indexOf(id);
            console.log(id + " " + JSON.stringify(docIds) + " " + docIds.includes(id));
            console.log(typeof id);
            console.log(typeof docIds[0])

            if(docIdIndex > -1) {
                docIds.splice(docIdIndex, 1);
                this.index[term] = docIds;

                if(docIds.length === 0) {
                    delete this.index[term];
                }
            }

            
        }
        
        delete this.ramDb[index][id];

        let deleteDocument = {};
        deleteDocument[ResultDocumentConstants.INDEX] = index;
        deleteDocument[ResultDocumentConstants.ID] = id;
        deleteDocument[ResultDocumentConstants.DOCUMENT] = document;

        ret[ResultDocumentConstants.SUCCESS] = true;
        ret[ResultDocumentConstants.DELETE_COUNT] = 1;
        ret[ResultDocumentConstants.DELETE] = deleteDocument;

        //console.log(this.ramDb);
        //console.log(this.index);

        return ret;
    }

    bulkDelete(index, docIds) {
        let ret = {};

        if(!index) {
            logger.error("Index is undefined.");
            return this.unsuccessfulDelete("Index is undefined.");
        }

        if(!this.indexExists(index)[ResultDocumentConstants.EXISTS]) {
            logger.error("Id Does Not Exist");
            return this.unsuccessfulDelete("Id does not exist for index.");
        }

        let deleted = [];
        let deleteCount = 0;

        for(let i = 0; i < docIds.length; i++) {
            let currDocId = docIds[i];
            let res = this.deleteDocument(index, currDocId);

            let isSuccess = res[ResultDocumentConstants.SUCCESS];

            if(isSuccess) {
                deleted.push(res[ResultDocumentConstants.DELETE]);
                deleteCount++;
            }
        }

        ret[ResultDocumentConstants.SUCCESS] = true;
        ret[ResultDocumentConstants.DELETE_COUNT] = deleteCount;
        ret[ResultDocumentConstants.BULK_DELETE] = deleted;

        return ret;
    }

    updateDocument(index, id, document) {
        let ret = {};
        console.log(document);

        if(!index) {
            logger.error("Index is undefined.");
            return this.unsuccessfulUpdate("Index is undefined.");
        }

        if(!this.indexExists(index)) {
            logger.error("Index does not exist.");
            return this.unsuccessfulUpdate("Index does not exist.");
        }

        if(!id) {
            logger.error("Id is undefined.");
            return this.unsuccessfulUpdate("Id is undefined.");
        }

        if(!this.idExists(index, id)[ResultDocumentConstants.ID_EXISTS]) {
            logger.error("Id does not exist.");
            return this.unsuccessfulUpdate("Id does not exist.");
        }
        let insertDoc = {};

        insertDoc[QueryDocumentConstants.INSERT] = document[QueryDocumentConstants.UPDATE];

        let deletedDoc = this.deleteDocument(index, id);
        this.insertDocument(index, insertDoc, id);

        ret[ResultDocumentConstants.SUCCESS] = true;
        ret[ResultDocumentConstants.UPDATE_COUNT] = 1;
        ret[ResultDocumentConstants.ORIGINAL_DOCUMENT] = deletedDoc[ResultDocumentConstants.DELETE];
        
        return ret;
    }

    bulkUpdate(index, documents) {
        let ret = {};

        if(!index) {
            logger.error("Index Is Undefined");
            return this.unsuccessfulDelete("Index is undefined.");
        }

        if(!this.indexExists(index)[ResultDocumentConstants.EXISTS]) {
            logger.error("Index Does Not Exist");
            return this.unsuccessfulDelete("Index does not exist.");
        }

        let updated = [];
        let updateCount = 0;

        for(let i = 0; i < documents.length; i++) {
            let currDoc = documents[i][QueryDocumentConstants.UPDATE];
            let currDocId = documents[i][QueryDocumentConstants.ID];
            let updatedDoc = this.updateDocument(index, currDocId, currDoc);

            let isSuccess = updatedDoc[ResultDocumentConstants.SUCCESS];

            if(isSuccess) {
                updated.push(updatedDoc[ResultDocumentConstants.ORIGINAL_DOCUMENT]);
                updateCount++;
            }
        }

        

        ret[ResultDocumentConstants.SUCCESS] = true;
        ret[ResultDocumentConstants.UPDATE_COUNT] = updateCount;
        ret[ResultDocumentConstants.BULK_UPDATE] = updated;

        return ret;
    }

    idExists(index, id) {
        let ret = {};

        if(!index) {
            logger.error("Index is undefined.");
            return this.unsuccessfulIdExists("Index is undefined.")
        }

        if(!id) {
            logger.error("Id is undefined.");
            return this.unsuccessfulIdExists("id is undefined.");
        }

        if(!this.indexExists(index)[ResultDocumentConstants.EXISTS]) {
            logger.error("Index does not exist.");
            return this.unsuccessfulIdExists("Index does not exist.");
        }

        ret[ResultDocumentConstants.SUCCESS] = true;
        ret[ResultDocumentConstants.ID_EXISTS] = id in this.ramDb[index];

        return ret;
    }

    unsuccessfulInsert(msg) {
        let ret = {};

        ret[ResultDocumentConstants.SUCCESS] = false;
        ret[ResultDocumentConstants.INSERT_COUNT] = 0;
        ret[ResultDocumentConstants.INSERT] = {};
        ret[ResultDocumentConstants.MESSAGE] = msg;

        return ret;

    }

    unsuccessfulDelete(msg) {
        let ret = {};

        ret[ResultDocumentConstants.SUCCESS] = false;
        ret[ResultDocumentConstants.DELETE_COUNT] = 0;
        ret[ResultDocumentConstants.DELETE] = {};
        ret[ResultDocumentConstants.MESSAGE] = msg;

        return ret;
    }

    unsuccessfulIdExists(msg) {
        let ret = {};

        ret[ResultDocumentConstants.SUCCESS] = false;
        ret[ResultDocumentConstants.MESSAGE] = msg;

        return ret;
    }

    unsuccessfulUpdate(msg) {
        let ret = {};

        ret[ResultDocumentConstants.SUCCESS] = false;
        ret[ResultDocumentConstants.MESSAGE] = msg;
        ret[ResultDocumentConstants.UPDATE] = {};
        ret[ResultDocumentConstants.UPDATE_COUNT] = 0;

        return ret;
    }
}