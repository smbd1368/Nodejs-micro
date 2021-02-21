"use strict";
let mongoose = require("mongoose");
let Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

let VehicleProfileSchema = new Schema({

	ownerName : {type : String },
	ownerNationalCode : {type : String },
	VIN : {type : String },
	plate : {type : String },
	vehicleType : {type : String },
	system : {type : String },
	tip : {type : String },
	model : {type : String },
	capacity : {type : Number },
	fuel : {type : String },
	color : {type : String },
	insurance : [
		{
			type : {type: String },
		 company : {type: String }
		},
	],
	engineNumber: {type : String },
	chassisNumber: {type : String },
	isDelete:{type : Boolean , default : false}
});

module.exports = mongoose.model("VehicleProfile", VehicleProfileSchema);
