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
 * along with Black Tesseract.  If not, see <https://www.gnu.org/licenses/>.
 */

const ConfigConstants = require("./const/config-constants");
const ResultDocumentConstants = require('./const/result-document-constants');
const QueryDocumentConstants = require('./const/query-document-constants');
const NetworkConstants = require('./const/network-constants');

const QueryParser = require("./query-parser");
const config = require("../black-tesseract").config;
const Tokenizer = require('./tokenizer');
const crypto = require("crypto");
const winston = require('winston');
const _ = require("lodash");
const RPCClient = require('./rpc/rpc-client');
const { promises } = require("fs");
const { loggers } = require("winston");

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = class DistributedRAMBasedInvertedIdex {
    constructor(cluster, invertedIndex, rpcInvertedIndex) {
        this.rpcClient = new RPCClient();
        this.cluster = cluster;
        this.invertedIndex = invertedIndex;
        this.rpcInvertedIndex = rpcInvertedIndex;
        this.nodes = this.cluster.getNodes();
        this.roundRobin = -1;
        this.init();
    }

    init() {
        let refreshNodes = () => {
            this.nodes = this.cluster.getNodes();
        }

        setInterval(refreshNodes, 5000);
    }

    createIndex(index, cb) {
        let res = this.invertedIndex.indexExists(index);
        let ret = {};

        if(res[ResultDocumentConstants.EXISTS]) {
            ret[ResultDocumentConstants.SUCCESS] = false;
            ret[ResultDocumentConstants.INDEX_EXISTS] = true;
            cb(ret);
            return;
        }

        let rpcData = {
            procedureName: "createIndex",
            parameters: [index]
        };

        
        let promises = [new Promise((resolve, reject) => {
            resolve(this.invertedIndex.createIndex(index))
        })];

        for(let i = 0; i < this.nodes.length; i++) {
            let currentNode = this.nodes[i];

            let promise = new Promise((resolve, reject) => {
                this.rpcClient.invokeRemoteProcedure(rpcData, currentNode["_nodeAddress"], NetworkConstants.RPC_PORT, (data, err) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve(JSON.parse(data.toString()));
                });
            });

            promises.push(promise);
        }

        // TODO: What if a node failed to create an index? 
        // Do we delete the index on the nodes it was added to?

        Promise.all(promises).then((values) => {
            let createdAll = true;
            let currRes;

            for(let i = 0; i < values.length; i++) {
                currRes = values[i];
                createdAll = createdAll && currRes[ResultDocumentConstants.SUCCESS];
            }

            if(createdAll) {
                cb(currRes);
            }
        });
    }

    insertDocument(dbIndex, document, id, cb) {
        let ret = {};

        let rpcData = {
            procedureName: "insertDocument",
            parameters: [dbIndex, document, id]
        };

        if(this.roundRobin == -1) {
            ret = this.invertedIndex.insertDocument(dbIndex, document, id);
            this.incrementRoundRobin();
            cb(ret);
            return;
        }

        let currentNode = this.nodes[this.roundRobin];

        let promise = new Promise((resolve, reject) => {
            this.rpcClient.invokeRemoteProcedure(rpcData, currentNode["_nodeAddress"], NetworkConstants.RPC_PORT, (data, err) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(JSON.parse(data.toString()));
            });
        });

        promise.then((data,err) => {
            if(err) {
                cb(undefined, err);
                this.incrementRoundRobin();
                return;
            }

            cb(data);
            this.incrementRoundRobin();
        });
    }

    simpleSearch(index, query, cb) {
        let rpcData = {
            procedureName: "simpleSearch",
            parameters: [index, query]
        };

        let promises = [new Promise((resolve, reject) => {
            resolve(this.invertedIndex.simpleSearch(index, query));
        })];

        for(let i = 0; i < this.nodes.length; i++) {
            let currentNode = this.nodes[i];

            let promise = new Promise((resolve, reject) => {
                this.rpcClient.invokeRemoteProcedure(rpcData, currentNode["_nodeAddress"], NetworkConstants.RPC_PORT, (data, err) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve(JSON.parse(data.toString()));
                });
            });

            promises.push(promise);
        }

        // TODO: What if a node failed to create an index? 
        // Do we delete the index on the nodes it was added to?

        Promise.all(promises).then((values) => {
            let res = {};

            let foundDocs = [];

            for(let i = 0; i < values.length; i++) {
                let currRes = values[i];
                let currDocs = currRes[ResultDocumentConstants.DOCUMENTS];
                foundDocs.push(...currDocs);
            }

            res[ResultDocumentConstants.SUCCESS] = true;
            res[ResultDocumentConstants.DOCUMENTS] = foundDocs;
            res[ResultDocumentConstants.COUNT] = foundDocs.length;
            cb(res);
        });
    }

    indexExists(index, cb) {
        if(!index) {
            logger.error("Index is undefined");
            return this.unsuccessfulIndexExists("Index is undefined");
        }

        cb(this.invertedIndex.indexExists(index));
    }

    bulkInsert(index, documents, cb) {
        let promises = [];
        let res = {};

        for(let i = 0; i < documents[QueryDocumentConstants.BULK_INSERT_DOCS].length; i++) {
            let document = documents[QueryDocumentConstants.BULK_INSERT_DOCS][i];
            promises.push(new Promise((resolve, reject) => {
                this.insertDocument(index, document, document[QueryDocumentConstants.ID], (data) => {
                    resolve(data);
                });
            }));
        }

        Promise.all(promises).then((values) => {
            let count = 0;
            let failedCount = 0;
            let insertedDocs = [];
            let failedInsertedDocs = [];

            for(let i = 0; i < values.length; i++) {
                if(!values[i][ResultDocumentConstants.SUCCESS]) {
                    failedInsertedDocs.push(values[i][ResultDocumentConstants.INSERT]);
                    failedCount++;
                    continue;
                }

                insertedDocs.push(values[i][ResultDocumentConstants.INSERT]);    
                count++;    
            }

            if(failedCount > 0) {
                res[ResultDocumentConstants.SUCCESS] = false;
            }
            else {
                res[ResultDocumentConstants.SUCCESS] = true;
            }

            res[ResultDocumentConstants.BULK_INSERT] = insertedDocs;
            res[ResultDocumentConstants.COUNT] = count;
            res[ResultDocumentConstants.FAILED_COUNT] = failedCount;
            res[ResultDocumentConstants.FAILED_DOCUMENTS] = failedInsertedDocs;

            cb(res);
        });
    }

    size(index, cb) {
        let res = {};

        if(!index) {
            logger.error("Index is undefined.");
            cb(this.unsuccessfulSize("Index is undefined."));
        }

        if(!this.invertedIndex.indexExists(index)) {
            logger.error("Index [" + index + "] does not exist.");
            cb(this.unsuccessfulSize("Index [" + index + "] does not exist."));
        }

        let promises = [
            new Promise((resolve, reject) => {
                resolve(this.invertedIndex.size(index))
            })
        ];

        let rpcData = {
            procedure: "size",
            parameters: [index]
        };

        for(let i = 0; i < this.nodes.length; i++) {
            promises.push(new Promise((resolve, reject) => {
                this.rpcClient.invokeRemoteProcedure(rpcData, currentNode["_nodeAddress"], NetworkConstants.RPC_PORT, (data, err) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve(JSON.parse(data.toString()));
                });
            }));
        }

        Promise.all(promises).then((values) => {
            let totalSize = 0;

            for(let i = 0; i < values.length; i++) {
                let value = values[i];
                totalSize += value[ResultDocumentConstants.SIZE];
            }

            res[ResultDocumentConstants.SUCCESS] = true;
            res[ResultDocumentConstants.SIZE] = totalSize;
            cb(res);
        });
    }

    deleteDocument(index, id, cb) {
        if(!index) {
            logger.error("Index is undefined.");
            return this.unsuccessfulDelete("Index is undefined.");
        }

        if(!id) {
            logger.error("Id is undefined.");
            return this.unsuccessfulDelete("Id is undefined.");
        }

        if(!this.invertedIndex.indexExists(index)) {
            logger.error("Index [" + index + "] does not exist.");
            return this.unsuccessfulDelete("Index [" + index + "] does not exist.");
        }

        let rpcData = {
            procedure: "deleteDocument",
            parameters: [index, id]
        };

        let promises = [
            new Promise((resolve, reject) => {
                resolve(this.invertedIndex.deleteDocument(index, id));
            })
        ];

        for(let i = 0; i < this.nodes.length; i++) {
            promises.push(new Promise((resolve, reject) => {
                this.rpcClient.invokeRemoteProcedure(rpcData, currentNode["_nodeAddress"], NetworkConstants.RPC_PORT, (data, err) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve(JSON.parse(data.toString()));
                });
            }));
        }

        Promise.all(promises).then((values) => {
            let deleted = false;
            let deletedDoc = undefined;

            for(let i = 0; i < values.length; i++) {
                let value = values[i];

                if(!value[ResultDocumentConstants.SUCCESS]) {
                    deletedDoc = value;
                    continue;
                }
                else {
                    deletedDoc = value;
                    break;
                }
            }

            cb(deletedDoc);
        });
    }

    bulkDelete(index, documents, cb) {
        let promises = [];
        let res = {};
 
        for(let i = 0; i < documents[QueryDocumentConstants.BULK_DELETE_DOCS].length; i++) {
            let id = documents[QueryDocumentConstants.BULK_DELETE_DOCS][i];
            promises.push(new Promise((resolve, reject) => {
                this.deleteDocument(index, id, (data) => {
                    resolve(data);
                });
            }));
        }

        Promise.all(promises).then((values) => {
            let deletedDocs = [];
            let deleteCount = 0;

            for(let i = 0; i < values.length; i++) {
                let value = values[i];
                let deletedDoc = {};

                deletedDoc[ResultDocumentConstants.INDEX] = value[ResultDocumentConstants.DELETE][ResultDocumentConstants.INDEX];
                deletedDoc[ResultDocumentConstants.DOCUMENT] = value[ResultDocumentConstants.DELETE][ResultDocumentConstants.DOCUMENT];
                deletedDoc[ResultDocumentConstants.ID] = value[ResultDocumentConstants.DELETE][ResultDocumentConstants.ID];

                if(value[ResultDocumentConstants.SUCCESS]) {
                    deletedDocs.push(deletedDoc);
                    deleteCount++;
                }
            }

            res[ResultDocumentConstants.SUCCESS] = true;
            res[ResultDocumentConstants.BULK_DELETE] = deletedDocs;
            res[ResultDocumentConstants.DELETE_COUNT] = deleteCount;

            cb(res);
        });
    }

    updateDocument(index, id, document, cb) {
        let rpcData = {
            procedureName: "updateDocument",
            parameters: [index, id, document]
        };

        let promises = [
            new Promise((resolve, reject) => {
                cb(this.invertedIndex.updateDocument(index, id, document));
            })
        ]

        for(let i = 0; i < this.nodes.length; i++) {
            let promise = new Promise((resolve, reject) => {
                this.rpcClient.invokeRemoteProcedure(rpcData, currentNode["_nodeAddress"], NetworkConstants.RPC_PORT, (data, err) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve(JSON.parse(data.toString()));
                });
            });

            promises.push(promise);
        }

        Promise.all(promises).then((values) => {
            let res = undefined;
            for(let i = 0; i < values.length; i++) {
                res = values[i];

                if(res[ResultDocumentConstants.SUCCESS]) {
                    break;
                }
            }
            cb(res);
        });
    }

    bulkUpdate(index, documents, cb) {
        let promises = [];
        let updateDocs = documents[QueryDocumentConstants.BULK_UPDATE];

        for(let i = 0; i < updateDocs.length; i++) {
            let promise = new Promise((resolve, reject) => {
                this.updateDocument(index, updateDocs[i][QueryDocumentConstants.ID], updateDocs[i], (res) => {
                    resolve(res);
                });
            });

            promises.push(promise);
        }

        Promise.all(promises).then((values) => {
            let res = {};
            let updatedDocs = [];
            let updateCount = 0;

            for(let i = 0; i < values.length; i++) {
                let orig = {};
                orig[ResultDocumentConstants.ORIGINAL_DOCUMENT] = values[i][ResultDocumentConstants.ORIGINAL_DOCUMENT];
                updatedDocs.push(orig);
                updateCount++;
            }

            res[ResultDocumentConstants.SUCCESS] = true;
            res[ResultDocumentConstants.BULK_UPDATE] = updatedDocs;
            res[ResultDocumentConstants.UPDATE_COUNT] = updateCount;

            cb(res);
        });
    }

    idExists(index, id) {

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

    unsuccessfulBulkDelete(msg) {
        let ret = {};

        ret[ResultDocumentConstants.SUCCESS] = false;
        ret[ResultDocumentConstants.DELETE_COUNT] = 0;
        ret[ResultDocumentConstants.BULK_DELETE] = {};
        ret[ResultDocumentConstants.MESSAGE] = msg;

        return ret;
    }

    unsuccessfulIdExists(msg) {
        let ret = {};

        ret[ResultDocumentConstants.SUCCESS] = false;
        ret[ResultDocumentConstants.MESSAGE] = msg;

        return ret;
    }

    unsuccessfulIndexExists(msg) {
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

    unsuccessfulSize(msg) {
        let ret = {};

        ret[ResultDocumentConstants.SUCCESS] = false;
        ret[ResultDocumentConstants.MESSAGE] = msg;
        ret[ResultDocumentConstants.SIZE] = -1;

        return ret;
    }

    getRandomIndex(nodes) {
        return Math.floor(Math.random() * nodes.length);
    }

    getNodes() {
        return this.nodes;
    }

    incrementRoundRobin() {
        if(this.roundRobin == this.nodes.length-1) {
            this.roundRobin = -1;
        }
        else {
            this.roundRobin++;
        }
    }
}