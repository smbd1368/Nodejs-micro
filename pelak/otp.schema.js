module.exports = {
    insert: {
        "type": "object",
        "properties": {
            "objectId": { "type": "string" },
            "mobileNumber": { "type": "string" },
            "verificationCode": { "type": "string" },
            "validityDate": { "type": "string" },
            "plateNumber": { "type": "string" },
            "isVerified": { "type": "boolean" },
        },

    },
    update: {
        "type": "object",
        "properties": {
            "objectId": { "type": "string" },
            "mobileNumber": { "type": "string" },
            "verificationCode": { "type": "string" },
            "plateNumber": { "type": "string" },
            "validityDate": { "type": "string" },
            "isVerified": { "type": "boolean" },
        },

    },
}
