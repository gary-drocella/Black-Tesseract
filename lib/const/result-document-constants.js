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

const ID = "_id";
const INDEX = "_index";
const DOCUMENT = "_document";
const BOOLEAN_SCORE = "_boolean_score";

const SUCCESS = "_success";
const COUNT = "_count";
const DOCUMENTS = "_documents";
const EXISTS = "_exists";
const CREATED_INDEX = "_created_index";
const MESSAGE = "_message";
const INSERT = "_inserted";
const BULK_INSERT = "_bulk_inserted";
const INSERT_COUNT = "_insert_count";
const SIZE = "_size";
const DELETE_COUNT = "_delete_count";
const DELETE = "_deleted";
const BULK_DELETE = "_bulk_deleted";
const ID_EXISTS = "_id_exists";
const UPDATE = "_updated";
const ORIGINAL_DOCUMENT = "_original_document";
const BULK_UPDATE = "_bulk_updated";
const UPDATE_COUNT = "_update_count";
const ORIGINAL_DOCUMENTS = "_original_documents";
const INDEX_EXISTS = "_index_exists";
const FAILED_COUNT = "_failed_count";
const FAILED_DOCUMENTS = "_failed_documents";

module.exports = class ResultDocumentConstants {
    static get ID() {
        return ID;
    }

    static get INDEX() {
        return INDEX;
    }

    static get DOCUMENT() {
        return DOCUMENT;
    }

    static get BOOLEAN_SCORE() {
        return BOOLEAN_SCORE;
    }

    static get SUCCESS() {
        return SUCCESS;
    }

    static get COUNT() {
        return COUNT;
    }

    static get DOCUMENTS() {
        return DOCUMENTS;
    }

    static get EXISTS() {
        return EXISTS;
    }

    static get CREATED() {
        return CREATED;
    }

    static get MESSAGE() {
        return MESSAGE;
    }

    static get INSERT() {
        return INSERT;
    }

    static get BULK_INSERT() {
        return BULK_INSERT;
    }

    static get INSERT_COUNT() {
        return INSERT_COUNT;
    }
    
    static get SIZE() {
        return SIZE;
    }

    static get DELETE() {
        return DELETE;
    }

    static get DELETE_COUNT() {
        return DELETE_COUNT;
    }

    static get ID_EXISTS() {
        return ID_EXISTS;
    }

    static get BULK_DELETE() {
        return BULK_DELETE;
    }

    static get CREATED_INDEX() {
        return CREATED_INDEX;
    }

    static get UPDATE() {
        return UPDATE;
    }

    static get BULK_UPDATE() {
        return BULK_UPDATE;
    }

    static get ORIGINAL_DOCUMENT() {
        return ORIGINAL_DOCUMENT;
    }

    static get UPDATE_COUNT() {
        return UPDATE_COUNT;
    }

    static get INDEX_EXISTS() {
        return INDEX_EXISTS;
    }

    static get FAILED_COUNT() {
        return FAILED_COUNT;
    }

    static get FAILED_DOCUMENTS() {
        return FAILED_DOCUMENTS;
    }
}