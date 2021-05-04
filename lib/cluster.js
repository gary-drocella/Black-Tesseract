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

const config = require('../black-tesseract').config;
const dataGram = require('dgram');
const ConfigConstants = require('./const/config-constants');
const NetworkConstants = require('./const/network-constants');
const TimeConstants = require('./const/time-constants');
const ClusterConstants = require('./const/cluster-constants');
const winston = require('winston');

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = class Cluster {
    constructor() {
        this.nodes = [];
        this.port = config[ConfigConstants.CLUSTER][ConfigConstants.PORT];
        this.networkInterface = config[ConfigConstants.CLUSTER][ConfigConstants.NETWORK_INTERFACE];
        this.igmpAddress = ClusterConstants.CLUSTER_IGMP_ADDRESS
    }

    async startDataNode() {
        let client = dataGram.createSocket("udp4");

        client.on("listening", () => {
            client.setBroadcast(true);
            client.setMulticastTTL(128);
            client.addMembership(this.igmpAddress, this.networkInterface);
        });

        client.on("message", (msg, rinfo) => {
            let msgData = msg.toString();

            if(msgData === ClusterConstants.CLUSTER_DISCOVERY_MSG) {
                let nodeAddress = rinfo.address;
                let nodePort = rinfo.port;

                if(!(this.containsNode(nodeAddress)) && nodeAddress !== this.networkInterface) {
                    logger.info("Discovered new node with address " + nodeAddress + ":" + nodePort);
                    this.nodes.push({"_nodeAddress" : nodeAddress, "_nodePort" : nodePort});
                }
            }

        });

        let broadcast = () => {
            var message = new Buffer(ClusterConstants.CLUSTER_DISCOVERY_MSG);
            client.send(message, 0, message.length, this.port, ClusterConstants.CLUSTER_IGMP_ADDRESS);
            logger.debug("broadcasted " + message + " over the wire...");
        }

        logger.info("Cluster Data Node Binding to Network Interface: " + this.networkInterface + " on port " + this.port);
        client.bind(this.port, this.networkInterface);


        setInterval(broadcast, TimeConstants.CLUSTER_BROADCAST_TIME);
    }

    async startMasterNode() {
        let server = dataGram.createSocket("udp4");

        server.on("listening", () => {
            server.setBroadcast(true);
            server.setMulticastTTL(128);
            server.addMembership(this.igmpAddress, this.networkInterface);
        });

        server.on("message", (msg, rinfo) => {
            let msgData = msg.toString();

            if(msgData === ClusterConstants.CLUSTER_DISCOVERY_MSG) {
                let nodeAddress = rinfo.address;
                let nodePort = rinfo.port;

                if(!(this.containsNode(nodeAddress)) && nodeAddress !== this.networkInterface) {
                    logger.info("Discovered new node with address " + nodeAddress + ":" + nodePort);
                    this.nodes.push({"_nodeAddress" : nodeAddress, "_nodePort" : nodePort});
                }
            }

        });

        logger.info("Cluster Master Node Binding to Multicast Address: " + this.igmpAddress + " on port " + this.port);
        server.bind(this.port, this.igmpAddress);
    }

    getNodes() {
        return this.nodes;
    }

    containsNode(nodeAddress) {
        for(let i = 0; i < this.nodes.length; i++) {
            let currNode = this.nodes[i];

            if(currNode["_nodeAddress"] == nodeAddress) {
                return true;
            }
        }

        return false;
    }
}