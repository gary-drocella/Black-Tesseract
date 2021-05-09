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

/**
 * __________.__                 __     ___________                                              __   
 * \______   \  | _____    ____ |  | __ \__    ___/___   ______ ______ ________________    _____/  |_ 
 * |    |  _/  | \__  \ _/ ___\|  |/ /   |    |_/ __ \ /  ___//  ___// __ \_  __ \__  \ _/ ___\   __\
 * |    |   \  |__/ __ \\  \___|    <    |    |\  ___/ \___ \ \___ \\  ___/|  | \// __ \\  \___|  |  
 * |______  /____(____  /\___  >__|_ \   |____| \___  >____  >____  >\___  >__|  (____  /\___  >__|  
 *        \/          \/     \/     \/              \/     \/     \/     \/           \/     \/     
 * 
 * @author Gary Drocella
 * @date 04/27/2021
 * Description: Black Tesseract is a Scalable and Distributed RAM Based Inverted Index NoSQL Database.
 * It is a cache that is meant to be used in conjunction with Inverted Indexes that persist to the hard disk such as
 * Elasticsearch for quick search lookup.
 */

const RAMBasedInvertedIndex = require('./lib/inverted-index');
const Cluster = require('./lib/cluster');
const RPCRAMBasedInvertedIndexServer = require('./lib/rpc-inverted-index-server');
const DistributedRAMBasedInvertedIndex = require('./lib/distributed-inverted-index');
const RestAPI = require('./lib/rest-api');
const config = require('./black-tesseract').config;
const ConfigConstants = require('./lib/const/config-constants');

const winston = require('winston');

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

let displayBanner = () => {
    console.log(require('./lib/terminal-ascii-art').terminalASCIIArt);
    console.log("You know... for search");
};

(function () {
    displayBanner();

    let cluster = new Cluster();

    if(config.cluster.node.roles.includes(ConfigConstants.MASTER_NODE)) {
        cluster.startMasterNode();
    }

    if(config.cluster.node.roles.includes(ConfigConstants.DATA_NODE)) {
        cluster.startDataNode();
    }

    let invertedIndex = new RAMBasedInvertedIndex();

    let rpcServer = new RPCRAMBasedInvertedIndexServer(invertedIndex);
    rpcServer.start();

    let distributedInvertedIndex = new DistributedRAMBasedInvertedIndex(cluster, invertedIndex, rpcServer);
    let restAPI = new RestAPI(distributedInvertedIndex);

    restAPI.start();
})();

