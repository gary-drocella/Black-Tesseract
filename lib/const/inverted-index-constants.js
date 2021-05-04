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
 * along with Foobar.  If not, see <https://www.gnu.org/licenses/>.
 */

const PROCEDURE_CREATE_INDEX = "createIndex";
const PROCEDURE_INDEX_EXISTS = "indexExists";
const PROCEDURE_INSERT_DOCUMENT = "insertDocument";
const PROCEDURE_UPDATE_DOCUMENT = "updateDocument";
const PROCEDURE_DELETE_DOCUMENT = "deleteDocument";
const PROCEDURE_SIMPLE_SEARCH = "simpleSearch";
const PROCEDURE_BULK_INSERT_DOCUMENT = "bulkInsert";
const PROCEDURE_BULK_UPDATE_DOCUMENT = "bulkUpdate";
const PROCEDURE_BULK_DELETE_DOCUMENT = "bulkDelete"
const PROCEDURE_SIZE = "size";

module.exports = class InvertedIndexConstants {
    static get PROCEDURE_CREATE_INDEX() {
        return PROCEDURE_CREATE_INDEX;
    }

    static get PROCEDURE_INDEX_EXISTS() {
        return PROCEDURE_INDEX_EXISTS;
    }

    static get PROCEDURE_INSERT_DOCUMENT() {
        return PROCEDURE_INDEX_INSERT_DOCUMENT;
    }

    static get PROCEDURE_SIMPLE_SEARCH() {
        return PROCEDURE_SIMPLE_SEARCH;
    }

    static get PROCEDURE_BULK_INSERT_DOCUMENT() {
        return PROCEDURE_BULK_INSERT_DOCUMENT;
    }

    static get PROCEDURE_DELETE_DOCUMENT() {
        return PROCEDURE_DELETE_DOCUMENT;
    }

    static get PROCEDURE_SIZE() {
        return PROCEDURE_SIZE;
    }

    static get PROCEDURE_UPDATE_DOCUMENT() {
        return PROCEDURE_UPDATE_DOCUMENT;
    }

    static get PROCEDURE_BULK_DELETE_DOCUMENT() {
        return PROCEDURE_BULK_DELETE_DOCUMENT;
    }
}