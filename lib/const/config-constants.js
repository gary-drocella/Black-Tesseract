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

const TOKENIZER = "tokenizer";
const CLUSTER = "cluster";
const PORT = "port";
const NODE = "node";
const MASTER_NODE = "master";
const DATA_NODE = "data";
const NETWORK_INTERFACE = "networkInterface";

module.exports = class ConfigConstants {
    static get TOKENIZER() {
        return TOKENIZER;
    }

    static get CLUSTER() {
        return CLUSTER;
    }

    static get PORT() {
        return PORT;
    }

    static get NODE() {
        return NODE;
    }

    static get NETWORK_INTERFACE() {
        return NETWORK_INTERFACE;
    }

    static get MASTER_NODE() {
        return MASTER_NODE;
    }

    static get DATA_NODE() {
        return DATA_NODE;
    }
};