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

const express = require('express');
const app = express();
const fs = require("fs");
const config = require('../black-tesseract').config;
const bodyParser = require('body-parser');
const ConfigConstants = require('./const/config-constants');
const winston = require('winston');

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

app.use(bodyParser.json());

module.exports = class RestAPI {
    constructor(distributedInvertedIndex) {
        this.distributedInvertedIndex = distributedInvertedIndex;
    }

    start() {
        app.post('/create_index/:index', (req, res) => {
            this.distributedInvertedIndex.createIndex(req.params.index, (data, err) => {
                res.send(JSON.stringify(data));
            });
         });
         
         app.post('/insert/:index/:id', (req, res) => {
            this.distributedInvertedIndex.insertDocument(req.params.index, req.body, req.params.id, (data, err) => {
                res.send(JSON.stringify(data));
            });
         });

         app.post('/bulk_insert/:index', (req, res) => {
            this.distributedInvertedIndex.bulkInsert(req.params.index, req.body, (data, err) => {
                res.send(JSON.stringify(data));
            });
         });

         app.delete('/bulk_delete/:index', (req, res) => {
            this.distributedInvertedIndex.bulkDelete(req.params.index, req.body, (data, err) => {
                res.send(JSON.stringify(data));
            });
         });

         app.get('/search/:index', (req, res) => {
            this.distributedInvertedIndex.simpleSearch(req.params.index, req.query.q, (data, err) => {
                res.send(JSON.stringify(data));
            });
         });

         app.get('/size/:index', (req, res) => {
            this.distributedInvertedIndex.size(req.params.index, (data,err) => {
                res.send(JSON.stringify(data));
            });
         });

         app.delete('/:index/:id', (req, res) => {
            this.distributedInvertedIndex.deleteDocument(req.params.index, req.params.id, (data, err) => {
                res.send(JSON.stringify(data));
            });
         });

         app.post('/update/:index/:id', (req, res) => {
            this.distributedInvertedIndex.updateDocument(req.params.index, req.params.id, req.body, (data, err) => {
                res.send(JSON.stringify(data));
            });
         });

         app.post('/bulk_update/:index', (req, res) => {
            this.distributedInvertedIndex.bulkUpdate(req.params.index, req.body, (data,err) => {
                res.send(JSON.stringify(data));
            })
         });

         var server = app.listen(8085, config[ConfigConstants.CLUSTER][ConfigConstants.NETWORK_INTERFACE] ,function () {
            var host = server.address().address
            var port = server.address().port
            logger.info("Black TesseracT REST API listening at http://" + host + ":" + port);
         });
    }
}

