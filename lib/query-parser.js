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

module.exports = class QueryParser {
    constructor() {

    }

    parse(query) {
        /* Currently the database will only perform simple queries.
         * A simple query is the union of the set of documents found for each term in the query...
         * TODO: Support advanced searches
         */

        let qData = query.split(" ");
        
        return qData;
    }

}