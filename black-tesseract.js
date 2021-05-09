
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
        networkInterface: "127.0.0.1",
        port: 44600
    },
    // LFU Cache Policy is not implemented yet...    
    cache : {
        policy : "LFU",
        maxSize : 1000,
    }
}