module.exports = {
    create: {
        "type": "object",
        "properties": {
            "ownerName": { "type": "string" },
            "ownerNationalCode": { "type": "string" },
            "VIN": { "type": "string" },
            "plate": { "type": "string" },
            "vehicleType": { "type": "string" },
            "system": { "type": "string" },
            "tip": { "type": "string" },
            "model": { "type": "string" },
            "capacity": { "type": "number" },
            "fuel": { "type": "string" },
			"color": { "type": "string" },
			"engineNumber": { "type": "string" },
			"chassisNumber": { "type": "string" },

            "insurance": {
				"type": "array" ,
				 "items" : {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string"
                        },
                        "company": {
                            "type": "string"
                        },
                    },
                    "required": ["type", "company"]
				},
			}
        },
		"required":["ownerName","ownerNationalCode","VIN","plate","vehicleType","system",
		"tip","model","capacity","fuel","color"]
    },
    selectAll : {
        "type": "object",
        "properties": {
        },
        "required": []
    },
    searchByPlate : {
        "type": "object",
        "properties": {
            "plate": { "type": "string" },
        },
        "required": ["plate"]
    },
}
