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

const config = require('../../black-tesseract').config;
const NetworkConstants = require('../const/network-constants');
const net = require('net');
const winston = require('winston');
const NetworkUtil = require('../network-util');
const ConfigConstants = require('../const/config-constants');

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = class RPCServer {
    constructor() {
        this.networkInterface = config[ConfigConstants.CLUSTER][ConfigConstants.NETWORK_INTERFACE];
    }

    start(cb) {
        let server = net.createServer((socket) => {
            socket.on("data", (data) => {
                let result = cb(NetworkUtil.deserializeRPC(data));
                socket.write(NetworkUtil.serializeRPC(result));
            });

            socket.on("error", (err) => {
                cb(undefined, err);
            });
        });
        
        server.listen(NetworkConstants.RPC_PORT, this.networkInterface);
    }

    getInvertedIndex() {
        return this.invertedIndex;
    }
};