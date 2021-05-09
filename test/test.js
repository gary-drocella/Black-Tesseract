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

var assert = require("assert");
var RAMBasedInvertedIndex = require('../lib/inverted-index');

describe("RAM Based Inverted Index", () => {
    describe("Simple Search", () => {
        it("should return multiple document results when performing a simple query", () => {
            let doc1 = "The quick brown fox jumped over the lazy dog.";
            let doc2 = "Hello, World!";
            let doc3 = "Goodbye Cruel World!";
            let doc4 = "The fox";
    
            let rbii = new RAMBasedInvertedIndex();
            let indx = "my_index";

            rbii.insertDocument(indx, doc1);
            rbii.insertDocument(indx, doc2);
            rbii.insertDocument(indx, doc3);
            rbii.insertDocument(indx, doc4);
    
            let results = rbii.simpleSearch(indx, "the goodbye");
        
            assert(results.length, 3);
            assert(results[0]._id, !undefined);
            assert(results[0]._document, !undefined);
            assert(results[0]._index, !undefined);
            assert(results[0]._document, "The quick brown fox jumped over the lazy dog.");
            assert(results[0]._index, indx);
            assert(results[1]._id, !undefined);
            assert(results[1]._document, !undefined);
            assert(results[1]._index, !undefined);
            assert(results[1]._document, "The fox");
            assert(results[1]._index, indx);
            assert(results[2]._id, !undefined);
            assert(results[2]._document, !undefined);
            assert(results[2]._index, !undefined);
            assert(results[2]._document, "Goodbye Cruel World!");
            assert(results[2]._index, indx);
        });
    });
});