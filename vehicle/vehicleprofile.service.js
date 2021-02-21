const _ = require("lodash");
const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const VehicleProfile = require("./vehicleprofile.model")
const Lib = require("../../libs/common");
const Schema = require("./vehicleprofile.schema");
const Response = require("../../classes/response");
const config = require("config");

module.exports = {
	name : "vehicleprofile" ,
	adapter: new MongooseAdapter(process.env.MONGO_URI || config.get("MONGO_URI")),
	mixins : [DbService],
	model : VehicleProfile,
	settings: {
		fields: [],
		entityValidator: {}
	},
	dependencies: [],
	hooks: {
		before : {
			async create(ctx){
				try{
					await Lib.validateSchema(ctx, Schema.create);
				}catch(err){
					throw err;
				}
			},
			async selectAll(ctx){
				try{
					await Lib.validateSchema(ctx, Schema.selectAll);
				}catch(err){
					throw err;
				}
			},
			async searchByPlate(ctx){
				try{
					await Lib.validateSchema(ctx, Schema.searchByPlate);
				}catch(err){
					throw err;
				}
			}
		}
	},
	actions : {
		create: {
			async handler(ctx) {
				let profile = await VehicleProfile.create({
					"ownerName" : ctx.params.ownerName,
					"ownerNationalCode" : ctx.params.ownerNationalCode,
					"VIN" : ctx.params.VIN,
					"plate" : ctx.params.plate,
					"vehicleType" : ctx.params.vehicleType,
					"system" : ctx.params.system,
					"tip" : ctx.params.tip,
					"model" : ctx.params.model,
					"capacity" : ctx.params.capacity,
					"fuel" : ctx.params.fuel,
					"color" : ctx.params.color,
					"insurance" : ctx.params.insurance,
					"engineNumber" : ctx.params.engineNumber,
					"chassisNumber" : ctx.params.chassisNumber,

			});
			let response = new Response();
				response.success = true;
				response.message = `new profile created`;
				response.result.id = profile._id;
				return response;
			}
		},
		selectAll : {
			async handler(ctx){
				let vehicle_profile_all = await VehicleProfile.find({})
						.skip(ctx.params.pageNum * ctx.params.count)
						.limit(ctx.params.count);
				let count = await VehicleProfile.find({})
						.countDocuments();
				let response = new Response()
					response.success = true;
					response.message = `vehicle profile all fetch successfully`;
					response.result.data = vehicle_profile_all;
					response.result.count = count;
				return response;
			}
		},
		searchByPlate : {
			async handler(ctx){
				let result = await VehicleProfile.find({plate:ctx.params.plate})
						.skip(ctx.params.pageNum * ctx.params.count)
						.limit(ctx.params.count);
				let count = await VehicleProfile.find({plate:ctx.params.plate})
						.countDocuments();
				let response = new Response()
					response.success = true;
					response.message = 'vehicle profile search by plate done';
					response.result.data = result;
					response.result.count = count;
				return response;
			}
		}
	},
	events: {

	},
	methods:{
	},

}
