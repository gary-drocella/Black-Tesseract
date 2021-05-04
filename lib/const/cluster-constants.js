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

const CLUSTER_DISCOVERY_MSG = "black-tesseract node disovery";
const CLUSTER_NODE_ROLE_MASTER = "master";
const CLUSTER_NODE_ROLE_DATA = "data";
const CLUSTER_IGMP_ADDRESS = "224.0.0.22";
const CLUSTER_PORT = 44009;

module.exports = class ClusterConstants {
    static get CLUSTER_DISCOVERY_MSG() {
        return CLUSTER_DISCOVERY_MSG;
    }

    static get CLUSTER_IGMP_ADDRESS() {
        return CLUSTER_IGMP_ADDRESS;
    }

    static get CLUSTER_PORT() {
        return CLUSTER_PORT;
    }

    static get CLUSTER_NODE_ROLE_MASTER() {
        return CLUSTER_NODE_ROLE_MASTER;
    }

    static get CLUSTER_NODE_ROLE_DATA() {
        return CLUSTER_NODE_ROLE_DATA;
    }

};