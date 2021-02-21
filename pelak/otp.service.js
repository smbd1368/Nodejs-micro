"use strict";
const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const Otp = require('./otp.model');
const config = require("config");
const Response = require("../../classes/response");
const Lib = require("../../libs/common");
const common = require("../../libs/common");
const moment = require('moment');
const MoleculerError = require("moleculer").Errors.MoleculerError;
const ForbiddenException = require('../../libs/exceptions').ForbiddenException;
const NotFoundException = require('../../libs/exceptions').NotFoundException;
const schemaValidationException = require('../../libs/exceptions').schemaValidationException;
module.exports = {
    name: "otp",
    model: Otp,
    mixins: [DbService],
    adapter: new MongooseAdapter(process.env.MONGO_URI || config.get("MONGO_URI")),
    settings: {
        fields: ["_id"]
    },
    hooks: {
        before: {
            async insert(ctx) {
                try {
                    await Lib.validateSchema(ctx, Schema.insert);
                }
                catch (err) {
                    throw err;
                }
            },
            async update(ctx) {
                try {
                    await Lib.validateSchema(ctx, Schema.update);
                }
                catch (err) {
                    throw err;
                }
            },
        },
        error: {
            async "*"(ctx, err) {
                console.log(err);

                let response = new Response();
                response.success = false;
                response.result = {};
                response.time = new Date();

                if (err instanceof NotFoundException) {
                    response.message = "Not Found!"
                    if (err.message = "Not Correct Password") {
                        response.errorCode = 'ncp'
                        return response;
                    };
                }

                if (err instanceof ForbiddenException) {
                    response.message = "Forbidden"
                    if (err.message = "You are not allowed to receive the password for to two minutes") {
                        response.errorCode = 'narp2m'
                        return response;
                    };
                }

                if (err instanceof NotFoundException) {
                    response.message = "Not Found!"
                    ctx.meta.$statusCode = 404;
                    if (err.message = "Not Found Sms Service!") {
                        response.errorCode = 'nfss'
                        return response;
                    };
                    return response;
                }

                if (err.code > 620) {
                    ctx.meta.$statusCode = 500;
                    response.message = err.errmsg;
                    response.errorCode = "5";
                    return response;
                }

                if (err instanceof ForbiddenException) {
                    response.message = err.message
                    response.errorCode = "3"
                    return response;
                }

                if (err instanceof NotFoundException) {
                    response.message = "Not Found!"
                    if (response.message = "Not Found!") {
                        response.errorCode = 'nnf'
                    };
                    return response;
                }

                if (err instanceof schemaValidationException) {
                    response.message = err.message
                    response.errorCode = "4";
                    return response;
                }
                else if (
                    !err instanceof NotFoundException &&
                    !err instanceof ForbiddenException &&
                    !err instanceof schemaValidationException &&
                    !err.code > 620
                ) {
                    ctx.meta.$statusCode = err.code;
                    response.message = err.message;
                    response.errorCode = err.type + "";;
                    return response;
                }
                else {
                    ctx.meta.$statusCode = 500;
                    response.message = err;
                    response.errorCode = "7";
                    return response;
                }
            }
        }
    },

    actions: {
        sendMobileOtp: {
            async handler(ctx) {
                // send sms pass  with webservices    

                var fromdate = new Date();
                let validitydate = moment(fromdate).add(2, 'm')
                // validitydate.setMinutes(fromdate.getMinutes() + (process.env.DURATION_TIME || config.get("DURATION_TIME")))

                let find_duplicate_verificationCode = await Otp.findOne(
                    {
                        "validityDate": { "$gte": Date(fromdate) }, "mobileNumber": ctx.params.mobileNumber, isVerified: false,
                    })

                if (find_duplicate_verificationCode != null) {
                    ctx.meta.$statusCode = 403;
                    throw new ForbiddenException("You are not allowed to receive the password for to two minutes");
                }
                let verificationCode = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);

                if (find_duplicate_verificationCode == null) {
                    // if mobile is if plat find mobile
                    let smssender = new Otp({
                        objectId: ctx.params.objectId,
                        mobileNumber: ctx.params.mobileNumber,
                        verificationCode: verificationCode,
                        validityDate: validitydate,
                        isVerified: false,
                    })
                    console.log('validitydate', validitydate)


                    const result = await ctx.broker.call('sms.sendSms', {
                        "subject": "کد تائید",
                        "text": smssender.verificationCode,
                        "link": "http://tax.cpay.ir",
                        "reciverCellphone": smssender.mobileNumber
                    });

                    if (!result || result.success == false) {
                        ctx.meta.$statusCode = 404;
                        throw new NotFoundException("not found sms service!");
                    }


                    if (result != null && result.success == true) {
                        smssender = await smssender.save()

                        var response = new Response();
                        response.success = true;
                        response.message = "SMS is created!";
                        response.result = {
                            mobileNumber: smssender.mobileNumber,
                            objectId: smssender.objectId,
                            otp: verificationCode
                        }
                        return response;
                    }
                }
            }
        },

        sendPlateOtp: {
            async handler(ctx) {
                // send sms pass  with webservices   
                //  need convert plate to mobile number               
                // var fromdate = new Date();
                // var validitydate = new Date(fromdate);
                // validitydate.setMinutes(fromdate.getMinutes() + (process.env.DURATION_TIME || config.get("DURATION_TIME")));
                var fromdate = new Date();
                let validitydate = moment(fromdate).add(process.env.DURATION_TIME || config.get("DURATION_TIME"), 'm')
                // validitydate.setMinutes(fromdate.getMinutes() + (process.env.DURATION_TIME || config.get("DURATION_TIME")))

                const message_data = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
                console.log("verfication code is: ", message_data);
                console.log("______________");

                let find_duplicate_verificationCode = await Otp.findOne(
                    {
                        "validityDate": { "$gte": Date(fromdate) }, "plateNumber": ctx.params.plate, isVerified: false,
                    })

                if (find_duplicate_verificationCode != null) {
                    ctx.meta.$statusCode = 403;
                    throw new ForbiddenException("You are not allowed to receive the password for to two minutes");
                }


                if (find_duplicate_verificationCode == null) {
                    // ctx.params.plate
                    const result = await ctx.broker.call('smspolice.sendSms', {
                        "plates": [ctx.params.plate, "", "http://tax.cpay.ir"]
                        // "templateName": "",
                        // "project": "http://tax.cpay.ir",
                        // "parameters": message_data
                    });


                    // if mobile is if plat find mobile
                    let smssender = new Otp({
                        objectId: ctx.params.objectId,
                        plateNumber: ctx.params.plate,
                        verificationCode: message_data,
                        validityDate: validitydate,
                        isVerified: false,
                    })
                    if (!result || result.success == false) {
                        ctx.meta.$statusCode = 404;
                        throw new NotFoundException("not found sms service!");
                    }

                    if (result != null && result.success == true) {
                        smssender = await smssender.save()

                        var response = new Response();
                        response.success = true;
                        response.message = "SMS is created!";
                        response.result = {
                            plateNumber: smssender.plateNumber,
                            objectId: smssender.objectId,
                        }
                        return response;
                    }

                }
            }
        },

        verification: {
            async handler(ctx) {
                try {
                    var fromdate = new Date();
                    var validitydate = new Date(fromdate);
                    validitydate.setMinutes(fromdate.getMinutes());
                    var date = new Date();
                    console.log('validitydate', validitydate)

                    if (ctx.params.verifyType == "mobile") {
                        //  if expire date for verify code
                        //  let finds_exipre_verificationCode = await Otp.findOne(
                        //     {
                        //         "validityDate": { "$lte":  validitydate }, "mobileNumber": ctx.params.mobileNumber, verificationCode: ctx.params.verificationCode, isVerified: false,
                        //     })
                        // if (finds_exipre_verificationCode != null) {
                        //     var response = new Response();
                        //     response.success = true;
                        //     response.message = "Verify is expired";
                        //     response.result = {
                        //         objectId: ctx.params.objectId,
                        //         validitydate: ctx.params.validitydate,
                        //     }
                        //     return response;
                        // }
                        //  if user is not verify

                        let query = {
                            "validityDate": { "$gte": validitydate }, "mobileNumber": ctx.params.mobileNumber, verificationCode: ctx.params.verificationCode, isVerified: false,
                        }

                        let finds = await Otp.findOne(query)
                        console.log(finds)
                        if (finds != null) {
                            let findsupdate = await Otp.findByIdAndUpdate({ _id: finds._id }, { isVerified: true });
                            console.log('findsupdate', findsupdate)
                            var response = new Response();
                            response.success = true;
                            response.message = "Verify is done";
                            response.result = {
                                objectId: findsupdate.objectId,
                                validitydate: findsupdate.validitydate,
                            }

                            // console.log('f response',response)
                            return response;
                        }

                        // if user repeat verify (verfiy was done)
                        // let finds_verify_true = await Otp.findOne(
                        //     {
                        //         "validityDate": { "$gte":  validitydate }, "mobileNumber": ctx.params.mobileNumber, verificationCode: ctx.params.verificationCode, isVerified: true,
                        //     })

                        // if (finds_verify_true != null) {

                        //     var response = new Response();
                        //     response.success = true;
                        //     response.message = "Verify Was Done";
                        //     response.result = {
                        //         objectId: ctx.params.objectId,
                        //         validitydate: ctx.params.validitydate,
                        //     }
                        //     return response;
                        //     }

                        if (finds == null) {
                            ctx.meta.$statusCode = 404;
                            throw new NotFoundException("Not Correct Password");
                        }
                    }
                    //if mobile and plate else
                    else if (ctx.params.verifyType == "plate") {
                        //  if expire date for verify code
                        //  let finds_exipre_verificationCode = await Otp.findOne(
                        //     {
                        //         "validityDate": { "$lte":  validitydate }, "mobileNumber": ctx.params.mobileNumber, verificationCode: ctx.params.verificationCode, isVerified: false,
                        //     })
                        // if (finds_exipre_verificationCode != null) {
                        //     var response = new Response();
                        //     response.success = true;
                        //     response.message = "Verify is expired";
                        //     response.result = {
                        //         objectId: ctx.params.objectId,
                        //         validitydate: ctx.params.validitydate,
                        //     }
                        //     return response;
                        // }
                        //  if user is not verify

                        let finds = await Otp.findOne(
                            {
                                "validityDate": { "$gte": validitydate }, "plateNumber": ctx.params.plateNumber, verificationCode: ctx.params.verificationCode, isVerified: false,
                            })
                        if (finds != null) {
                            let findsupdate = await Otp.updateOne({ _id: finds._id }, { isVerified: true });
                            var response = new Response();
                            response.success = true;
                            response.message = "Verify is done";
                            response.result = {
                                objectId: ctx.params.objectId,
                                validitydate: ctx.params.validitydate,
                            }
                            return response;
                        }


                        // if user repeat verify (verfiy was done)
                        // let finds_verify_true = await Otp.findOne(
                        //     {
                        //         "validityDate": { "$gte":  validitydate }, "plateNumber": ctx.params.plateNumber, verificationCode: ctx.params.verificationCode, isVerified: true,
                        //     })

                        // if (finds_verify_true != null) {

                        //     var response = new Response();
                        //     response.success = true;
                        //     response.message = "Verify Was Done";
                        //     response.result = {
                        //         objectId: ctx.params.objectId,
                        //         validitydate: ctx.params.validitydate,
                        //     }
                        //     return response;
                        // }
                        if (finds == null) {
                            ctx.meta.$statusCode = 404;
                            throw new NotFoundException("Not Correct Password");
                        }
                    }
                }


                catch (err) {
                    throw err;
                }


            },
        },
    }
}

