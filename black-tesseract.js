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

exports.config = {
    tokenizer : "en",
    cluster : {
        node : {
            // check these roles in index.js
            roles: [
                "master",
                "data"
            ]
        },
        networkInterface: "10.0.0.10",
        port: 44600
    },
    // LFU Cache Policy is not implemented yet...    
    cache : {
        policy : "LFU",
        maxSize : 1000,
    }
}