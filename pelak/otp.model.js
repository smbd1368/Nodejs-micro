let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let newsSchema = new Schema(
    {
	objectId : { type: String, require: true },
    mobileNumber : { type: String, require: true },
    verificationCode : { type: String, require: true },
    plateNumber: { type: String, require: true },
    validityDate: { type: Date, require: true },
    isVerified : { type: Boolean, require: true },
    }
);

module.exports = mongoose.model("otp", newsSchema);
