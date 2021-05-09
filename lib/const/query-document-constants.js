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

const BULK_INSERT_DOCS = "_bulk_insert_documents";
const BULK_DELETE_DOCS = "_bulk_delete_documents";
const QUERY = "_query";
const SIMPLE_SEARCH = "_simple_search";
const ID = "_id";
const INSERT = "_insert";
const UPDATE = "_update";
const DELETE = "_delete";
const BULK_UPDATE = "_bulk_update_documents";
const TEXT = "_text";

module.exports = class QueryDocumentConstants {
    static get BULK_INSERT_DOCS() {
        return BULK_INSERT_DOCS;
    }

    static get BULK_DELETE_DOCS() {
        return BULK_DELETE_DOCS;
    }

    static get QUERY() {
        return QUERY;
    }

    static get SIMPLE_SEARCH() {
        return SIMPLE_SEARCH;
    }

    static get ID() {
        return ID;
    }

    static get INSERT() {
        return INSERT;
    }

    static get UPDATE() {
        return UPDATE;
    }

    static get BULK_UPDATE() {
        return BULK_UPDATE;
    }

    static get TEXT() {
        return TEXT;
    }

    static get DELETE() {
        return DELETE;
    }
}