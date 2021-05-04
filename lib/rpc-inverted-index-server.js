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

const InvertedIndexConstants = require('./const/inverted-index-constants');
const RAMBasedInvertedIndex = require('./inverted-index');
const RPCServer = require('./rpc/rpc-server');
const RPCClient = require('./rpc/rpc-client');
const winston = require('winston');

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = class RPCRAMBasedInvertedIndexServer {
    constructor(invertedIndex) {
        this.invertedIndex = invertedIndex
        this.rpcServer = new RPCServer();
    }

    start() {
        this.rpcServer.start((rpcData, err) => {
            if(err) {
                logger.error("There was an error: " + err);
                return { error : err };
            }

            let resultData = {};
            // distributed bulk query options reuse single query operations, so no need to be present in switch case.

            switch(rpcData.procedureName) {
                case InvertedIndexConstants.PROCEDURE_CREATE_INDEX:
                    resultData = this.createIndex(...rpcData.parameters);
                    break;
                case InvertedIndexConstants.PROCEDURE_INSERT_DOCUMENT:
                    resultData = this.insertDocument(...rpcData.parameters);
                    break;
                case InvertedIndexConstants.PROCEDURE_SIMPLE_SEARCH:
                    resultData = this.simpleSearch(...rpcData.parameters);
                    break;
                case InvertedIndexConstants.PROCEDURE_INDEX_EXISTS: 
                    resultData = this.indexExists(...rpcData.parameters);
                    break;
                case InvertedIndexConstants.PROCEDURE_DELETE_DOCUMENT:
                    resultData = this.deleteDocument(...rpcData.parameters);
                    break;
                case InvertedIndexConstants.PROCEDURE_SIZE:
                    resultData = this.size(...rpcData.parameters);
                    break;
                case InvertedIndexConstants.PROCEDURE_UPDATE_DOCUMENT:
                    resultData = this.updateDocument(...rpcData.parameters);
                    break;
            }

            return resultData;
        });
    }

   createIndex(index) {
        if(!index) {
            logger.error("Could not create index because an index name was not given...");
            return { error: "Could not create index because an index name was not given..." };
        }

        return this.invertedIndex.createIndex(index);
   }

   insertDocument(dbIndex, document, id) {
        if(!dbIndex) {
            logger.error("Could not insert document because no database index name was given...");
            return { error: "Could not insert document because no database index name was given..."};
        }

        if(!document) {
            logger.error("Could not insert document because no document was given...");
            return { error: "Could not insert document because no document was given..."};

        }

        return this.invertedIndex.insertDocument(dbIndex, document, id);
    }

    simpleSearch(index, query) {
        if(!index) {
            logger.error("Could not perform simple search because no database index name was given...");
            return { error: "Could not perform simple search because no database index name was given..." };
        }

        if(!query) {
            logger.error("Could not perform simple search because no query was given...");
            return { error: "Could not perform simple search because no query was given..." };
        }

        return this.invertedIndex.simpleSearch(index, query);
    }

    indexExists(index) {
        if(!index) {
            logger.error("Could not perform index exists search because no index name was given...");
            return { error: "Could not perform index exists search because no index name was given..."};
        }

        return this.invertedIndex.indexExists(index);
    }

    bulkInsert(index, documents) {
        if(!documents) {
            logger.error("There are no documents to insert.");
            return { error: "There are no documents to insert." };
        }

        return this.invertedIndex.bulkInsert(index, documents);
    }

    deleteDocument(index, id) {
        if(!index) {
            logger.error("Could not perform delete document query because no index name was given...");
            return { error: "Could not perform delete document query because no index name was given..."};
        }

        if(!id) {
            logger.error("Could not perform delete document query because no id was given...");
            return { error : "Could not perform delete document query because no id was given..." };
        }

        return this.invertedIndex.deleteDocument(index, id);
    }

    updateDocument(index, id) {
        if(!index) {
            logger.error("Could not perform update document query because no index name was given...");
            return { error : "Could not perform update document query because no index name was given..."};
        }

        if(!id) {
            logger.error("Could not perform update document query because no id was given...");
            return { error : "Could not perform update document query because no id was given..."};
        }

        return this.invertedIndex.updateDocument(index, id);
    }

    size(index) {
        if(!index) {
            logger.error("Could not perform size operation because no index was given...");
            return { error : "Could not perform size operation because no index was given..." };
        }

        return this.invertedIndex.size(index);
    }
}