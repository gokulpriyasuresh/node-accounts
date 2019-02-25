let express = require('express');
let    bodyParser = require('body-parser');
let    morgan = require('morgan');
let    jwt    = require('jsonwebtoken');
let    config = require('./config');
let    app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let nodemailer = require("nodemailer");
let mg = require('nodemailer-mailgun-transport');
let mongoose = require("mongoose");
let uniqueValidator = require('mongoose-unique-validator');
let Validator = require('schema-validator');
let MongoClient =    require('mongodb').MongoClient;
//mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/Application",{ useNewUrlParser: true , useCreateIndex: true } );
let db = mongoose.connection;
var bcrypt = require('bcrypt-nodejs');
let uuidv4 = require('uuid/v4');
let fs = require('fs');
let htmltemplate = fs.readFileSync('mailtemplate.html',{encoding:'utf-8'});



let smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: true,
    host: "smtp.gmail.com",
    auth: {
        user: "nodejsmailertestacc@gmail.com",
        pass: "NODEtest12345678"
    }
});


//set secret
app.set('Secret', config.secret);

// use morgan to log requests to the console
app.use(morgan('dev'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.listen(3002,()=>{

    console.log('server is running on port 3002')

});
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var schema = mongoose.Schema;
var nameSchema = schema({
        firstname: {
            type: "string",
            required: true,
            description: "required and must be a string",

        },
        lastname: {
            type: "string",
            required: true,
            description: "required and must be a string",

        },
        username: {
            type: "string",
            required: true,
            description: "required and must be a string",
            unique:true

        },
        email: {
            type: "string",
            required: true,
            description: "required and must be a string",
            unique:true

        },
        reportto: {
            type: "string",
            required: true,
            description: "required and must be a string",
        },
        password: {
            type: "string",
            required: true,
            description: "required and must be a string",

        },
        empid: {
            type: "string",
            required: true,
            description: "required and must be a string",
            unique:true

        },
        emptype: {},
        totalsl: {
            type: "Number",
            required: true,
            description: "required and must be a Number",

        },
        compsl: {
            type: "Number",
            required: true,
            description: "required and must be a Number",

        },
        available_sl: {
            type: "Number",
            description: "must be a Number",

        },
        totalcl: {
            type: "Number",
            required: true,
            description: "required and must be a Number",

        },
        compcl: {
            type: "Number",
            required: true,
            description: "required and must be a Number",

        },
        available_cl: {
            type: "Number",
            description: "must be a Number",

        },
        dob: {
            type: "string",
            required: true,
            description: "required and must be a string",

        },
        doj: {
            type: "string",
            required: true,
            description: "required and must be a string",

        },
        address: {
            type: "string",
            required: true,
            description: "required and must be a string",

        },
        application: {
                type:"array",
                items : [
                {
                    type : "string"
                }
            ]
        },
        _id:{}
    },
    {
        versionKey: false // You should be aware of the outcome after set to false
    }
);
//Validations
nameSchema.plugin(uniqueValidator);
var validator = new Validator(nameSchema);
validator.debug = true;


// hash the password
nameSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
// checking if password is valid
nameSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

var extraSchema = schema({

    versionKey: false // You should be aware of the outcome after set to false

});

//Collection name
var User = mongoose.model("Users", nameSchema);
var extrainfo = mongoose.model("Extrainfo",nameSchema);

app.get('/', function(req, res) {
    res.send('App server is running on http://localhost:3002/');
});
app.post('/authentication/createuser/',(req,res) => {
    console.log(req.body);
    var u = new User({
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        username:req.body.username,
        email:req.body.email,
        reportto:req.body.reportto,
        empid : req.body.empid,
        emptype : req.body.emptype,
        totalsl : req.body.totalsl,
        compsl : req.body.compsl,
        available_sl: (req.body.totalsl) - (req.body.compsl),
        totalcl : req.body.totalcl,
        compcl : req.body.compcl,
        available_cl: (req.body.totalcl) - (req.body.compcl),
        dob : req.body.dob,
        doj : req.body.doj,
        address : req.body.address,
    });
    u.password = u.generateHash(req.body.password);
    u._id = uuidv4();
    u.application = [];
    u.save(function(err){
        if(err) {
            res.send(err);
        }
        else {
            res.json({
                message: 'User Account created successfully.',
                code: 200,
            });
        }
    });

});
app.get("/authentication/getuser/",function(req,res){
    var limitdata = req.query.limit ? JSON.parse(req.query.limit):"";
    var skipdata = req.query.skip ? JSON.parse(req.query.skip) : "";
    if(req.query.email){
        User.find({email:req.query.email},function(err,data){
            if(err) {
                res.send(err);
            }
            else {
                var result = data;
                if (result) {
                    res.json(result)
                } else {
                    res.json({
                        message: 'Records not found',
                    });
                }
            }
        });
    }else if(req.query.username){
        User.find({username:req.query.username},function(err,data){
            if(err) {
                res.send(err);
            }
            else {
                var result = data;
                if (result) {
                    res.json(result)
                } else {
                    res.json({
                        message: 'Records not found',
                    });
                }
            }
        });
    }else if(req.query.userid){
        User.find({_id:req.query.userid},function(err,data){
            if(err) {
                res.send(err);
            }
            else {
                var result = data;
                if (result) {
                    res.json(result)
                } else {
                    res.json({
                        message: 'Records not found',
                    });
                }
            }
        });
    } else {
        User.find({},function(err,data){
            if(err) {
                res.send(err);
            }
            else {
                if (data !== "") {
                    res.json(data)
                } else {
                    res.json({
                        message: 'Records not found',
                    });
                }
            }
        }).skip(skipdata).limit(limitdata);
    }

});

app.put("/authentication/updateuser",(req,res) =>{
    var updateemail = req.query.email;
    var updateusername = req.query.username;
    var updateuserid = req.query.userid;
    if(updateemail) {
        User.findOne({email: updateemail}, function (err, data) {
            if (err) {
                res.json(err);
            }
            else {
                var result = data;
                if(result){
                    if(req.body.currentpassword && req.body.newpassword) {
                        if (bcrypt.compareSync(req.body.currentpassword, result.password)) {
                            result.firstname = req.body.firstname;
                            result.lastname = req.body.lastname;
                            result.username = req.body.username;
                            result.email = req.body.email;
                            result.password = result.generateHash(req.body.newpassword);
                            result.empid = req.body.empid;
                            result.totalsl = req.body.totalsl;
                            result.compsl = req.body.compsl;
                            result.totalcl = req.body.totalcl;
                            result.compcl = req.body.compcl;
                            result.dob = req.body.dob;
                            result.doj = req.body.doj;
                            result.address = req.body.address;
                            result.save(function (err, result) {
                                if (err) {
                                    res.send(err);
                                }
                                else {
                                    res.json({
                                        message : "Updated Successfully",
                                        code : 200,
                                        data:result
                                    });
                                }
                            });
                        } else {
                            res.json({
                                message: 'Incorrect Password',
                                code: 400
                            });
                        }
                    }else{
                        result.firstname = req.body.firstname;
                        result.lastname = req.body.lastname;
                        result.username = req.body.username;
                        result.email = req.body.email;
                        result.empid = req.body.empid;
                        result.totalsl = req.body.totalsl;
                        result.compsl = req.body.compsl;
                        result.totalcl = req.body.totalcl;
                        result.compcl = req.body.compcl;
                        result.dob = req.body.dob;
                        result.doj = req.body.doj;
                        result.address = req.body.address;
                        result.save(function (err, result) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                res.json({
                                    message : "Updated Successfully",
                                    code : 200,
                                    data:result
                                });
                            }
                        });
                    }
                } else {
                    res.json({
                        message: 'Record with the given email not found',
                        code : 400
                    });
                }
            }
        });
    } else if(updateusername){
        User.findOne({username: updateusername}, function (err, data) {
            if (err) {
                res.json(err);
            }
            else {
                var result = data;
                if(result){
                    if(req.body.currentpassword && req.body.newpassword) {
                        if (bcrypt.compareSync(req.body.currentpassword, result.password)) {
                            result.firstname = req.body.firstname;
                            result.lastname = req.body.lastname;
                            result.username = req.body.username;
                            result.email = req.body.email;
                            result.password = result.generateHash(req.body.newpassword);
                            result.empid = req.body.empid;
                            result.totalsl = req.body.totalsl;
                            result.compsl = req.body.compsl;
                            result.totalcl = req.body.totalcl;
                            result.compcl = req.body.compcl;
                            result.dob = req.body.dob;
                            result.doj = req.body.doj;
                            result.address = req.body.address;
                            result.save(function (err, result) {
                                if (err) {
                                    res.send(err);
                                }
                                else {
                                    res.json({
                                        message : "Updated Successfully",
                                        code : 200,
                                        data:result
                                    });
                                }
                            });
                        } else {
                            res.json({
                                message: 'Incorrect Password',
                                code: 400
                            });
                        }
                    }else{
                        result.firstname = req.body.firstname;
                        result.lastname = req.body.lastname;
                        result.username = req.body.username;
                        result.email = req.body.email;
                        result.empid = req.body.empid;
                        result.totalsl = req.body.totalsl;
                        result.compsl = req.body.compsl;
                        result.totalcl = req.body.totalcl;
                        result.compcl = req.body.compcl;
                        result.dob = req.body.dob;
                        result.doj = req.body.doj;
                        result.address = req.body.address;
                        result.save(function (err, result) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                res.json({
                                    message : "Updated Successfully",
                                    code : 200,
                                    data:result
                                });
                            }
                        });
                    }
                } else {
                    res.json({
                        message: 'Record with the given username not found',
                        code : 400
                    });
                }
            }
        });
    } else if(updateuserid){
        User.findOne({_id: updateuserid}, function (err, data) {
            if (err) {
                res.json(err);
            }
            else {
                var result = data;
                if(result){
                    if(req.body.currentpassword && req.body.newpassword) {
                        if (bcrypt.compareSync(req.body.currentpassword, result.password)) {
                            result.firstname = req.body.firstname;
                            result.lastname = req.body.lastname;
                            result.username = req.body.username;
                            result.email = req.body.email;
                            result.password = result.generateHash(req.body.newpassword);
                            result.empid = req.body.empid;
                            result.totalsl = req.body.totalsl;
                            result.compsl = req.body.compsl;
                            result.totalcl = req.body.totalcl;
                            result.compcl = req.body.compcl;
                            result.dob = req.body.dob;
                            result.doj = req.body.doj;
                            result.address = req.body.address;
                            result.save(function (err, result) {
                                if (err) {
                                    res.send(err);
                                }
                                else {
                                    res.json({
                                        message : "Updated Successfully",
                                        code : 200,
                                        data:result
                                    });
                                }
                            });
                        } else {
                            res.json({
                                message: 'Incorrect Password',
                                code: 400
                            });
                        }
                    }else{
                        result.firstname = req.body.firstname;
                        result.lastname = req.body.lastname;
                        result.username = req.body.username;
                        result.email = req.body.email;
                        result.empid = req.body.empid;
                        result.totalsl = req.body.totalsl;
                        result.compsl = req.body.compsl;
                        result.totalcl = req.body.totalcl;
                        result.compcl = req.body.compcl;
                        result.dob = req.body.dob;
                        result.doj = req.body.doj;
                        result.address = req.body.address;
                        result.save(function (err, result) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                res.json({
                                    message : "Updated Successfully",
                                    code : 200,
                                    data:result
                                });
                            }
                        });
                    }
                } else {
                    res.json({
                        message: 'Record with the given userid not found',
                        code : 400
                    });
                }
            }
        });
    } else {
        res.json({
            message: 'Please provide username / email / userid',
            code : 400
        });
    }
});

app.delete("/authentication/deleteuser",function(req,res){
    var deleteemail = req.query.email;
    var deleteusername = req.query.username;
    if(deleteemail) {
        User.deleteOne({email: deleteemail}, function (err, data) {
            if (err) {
                res.json(err);
            }
            else {
                if(data.n) {
                    data.message = 'Successfully deleted';
                    res.status(200).send(data);
                }else {
                    res.json({
                        message: 'Record not found',
                    });
                }
            }
        });
    }else if (deleteusername){
        User.deleteOne({username: deleteusername}, function (err, data) {
            if (err) {
                res.json(err);
            }
            else {
                if(data.n) {
                    data.message = 'Successfully deleted';
                    res.status(200).send(data);
                }else {
                    res.json({
                        message: 'Record not found',
                    });
                }
            }
        });
    }else {
        res.json({
            message: 'Please provide username / email',
        });
    }
});

app.post('/authenticate/user',(req,res)=>{

    var qusername = req.body.username;
    var qemail = req.body.email;
    var qpassword = req.body.password;

    if(qusername && qpassword){
        User.findOne({username:qusername},function(err,data){
            if(err) {
                res.send(err);
            }
            else {
                var result = data;
                if (result){
                    if(bcrypt.compareSync(qpassword, result.password)){
                        const payload = {
                            check: true
                        };
                        //if eveything is okey let's create our token

                        var token = jwt.sign(payload, app.get('Secret'), {
                            expiresIn: 1440 // expires in 24 hours

                        });

                        res.json({
                            message: 'authentication done ',
                            token: token,
                            userdetails : result,
                        });
                    }else{
                        res.json({
                            message: 'Incorrect password',
                        });
                    }
                }else{
                    res.json({
                        message: 'Records not found',
                    });
                }
            }
        });
    }else if(qemail && qpassword){
        User.findOne({email:qemail},function(err,data){
            if(err) {
                res.send(err);
            }
            else {
                var result = data;
                if (result){
                    if(bcrypt.compareSync(qpassword, result.password)){
                        const payload = {
                            check: true
                        };
                        //if eveything is okey let's create our token

                        var token = jwt.sign(payload, app.get('Secret'), {
                            expiresIn: 1440 // expires in 24 hours

                        });

                        res.json({
                            message: 'authentication done ',
                            token: token,
                            userdetails : result,
                        });
                    }else{
                        res.json({
                            message: 'Incorrect password',
                        });
                    }
                } else {
                    res.json({
                        message: 'Records not found',
                    });
                }
            }
        });
    }else{
        res.json({
            message: 'Please provide username / email and password',
        });
    }
});

app.post('/send',function(req,res){
    var mailOptions={
        from: req.body.from,
        to : req.body.to,
        subject : req.body.subject,
        text : req.body.text,
        html : htmltemplate
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.json({
                message: 'Mail sending failed',
                code: 400,
            });
        }else{
            console.log("Message sent: " + JSON.stringify(response));
            res.json({
                message: 'Mail sent successfully',
                code: 200,
            });
        }
    });
});

function sendEMail(mailOptions){
    var data = [];
    var temp = htmltemplate ;
    var name = mailOptions.firstname ? (mailOptions.firstname + mailOptions.lastname) : mailOptions.reportto ;
    var changedtemp = temp.replace("[CONTENT]", mailOptions.content).replace("[APPLIED_SL]", mailOptions.applied_sl).replace("[APPLIED_CL]", mailOptions.applied_cl).replace("[APPLIED_WFH]", mailOptions.applied_wfh).replace("[STATUS]", mailOptions.status).replace("[NAME]", name);
    var toids = [];
    toids.push(mailOptions.to);
    toids.push("gokulpriyasuresh@outlook.com");
    //toids.push("rngk768@gmail.com");
    var maildata = {
        to : toids,//mailOptions.to,
        subject : mailOptions.subject,
        html :changedtemp
    }
    smtpTransport.sendMail(maildata, function(error, response){
        if(error){
            data . code = 400;
            data . message = 'Mail sending failed';
            console.log(data);
        }else{
            console.log("Message sent: " + JSON.stringify(response));
            data . code = 200;
            data . message = 'Mail sent successfully';
            console.log(data);
        }
    });
    return data;
}


app.post('/authentication/applyleave/',(req,res) => {
    var updateuserid = req.query.userid;
    var postdata = {
        userid: req.body.userid,
        empid:req.body.emplid,
        reason: req.body.reason,
        applieddate: req.body.applieddate,
        applied_sl: req.body.applied_sl,
        applied_cl: req.body.applied_cl,
        applied_wfh: req.body.applied_wfh,
        content: req.body.content,
        status: req.body.status
    };
    postdata.applicationid =  uuidv4();
    User.findOne({_id: updateuserid}, function (err, data) {
        if (err) {
            res.json(err);
        }
        else {
            var result = data;
            if(result){
                        result.application.push(postdata);
                        result.save(function (err, result) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                var mailOptions = {
                                    to : result.reportto,
                                    subject : req.body.reason,
                                    content : req.body.content,
                                    applied_sl: req.body.applied_sl,
                                    applied_cl: req.body.applied_cl,
                                    applied_wfh: req.body.applied_wfh,
                                    firstname : result.firstname,
                                    lastname : result.lastname,
                                    status : req.body.status,
                                }
                                sendEMail(mailOptions);
                                res.json({
                                        message: "Created Successfully and sent mail",
                                        code: 200,
                                        data: result
                                });
                            }
                        });
            } else {
                res.json({
                    message: 'Record with the given userid not found',
                    code : 400
                });
            }
        }
    });

});

app.get('/authentication/applications/',(req,res) => {
    var appid = req.query.id ? req.query.id : '';
    var userid = req.query.userid ? req.query.userid : '';

if(appid && userid){
    User.findOne({_id: userid}, function (err, data) {
        if (err) {
            res.json(err);
        }
        else {
            var result = data;
            if (result) {
                var tempapp = [];
                for (var i=0 ; i<result.application.length; i++){
                    var app = result.application[i];
                    if (appid === app.applicationid) {
                        tempapp.push(app);
                    }
                }
                result.application = tempapp;
                if(tempapp.length > 0) {
                    res.json({
                        message: "Applications retrived Successfully",
                        code: 200,
                        data: result
                    });
                }else{
                    res.json({
                        message: "No applications found.",
                        code: 400
                    });
                }
            } else {
                res.json({
                    message: 'Record with the given userid not found',
                    code: 400
                });
            }
        }
    });
}else if (userid && (!appid || appid === '')){
    User.findOne({_id: userid}, function (err, data) {
        if (err) {
            res.json(err);
        }
        else {
            var result = data;
            if (result) {
                var totalapps = [];
                for (var i=0 ; i<result.application.length; i++){
                    var userapps = result.application[i];
                    totalapps.push(userapps);
                }
                result .application = totalapps;
                if(totalapps.length > 0) {
                    res.json({
                        message: "Applications retrived Successfully",
                        code: 200,
                        data: result
                    });
                }else{
                    res.json({
                        message: "No applications found.",
                        code: 400
                    });
                }
            } else {
                res.json({
                    message: 'Record with the given userid not found',
                    code: 400
                });
            }
        }
    });
}else if (appid && (!userid || userid === '')) {
    User.find({},function(err,data){
        if(err) {
            res.send(err);
        }
        else {
            if (data !== "") {
                var singleapp = [];
                Loop1:
                for (var i=0 ; i<data.length; i++){
                    var result =data[i];
                    var sinuser = data[i];
                    Loop2:
                    for(var j=0 ; j<sinuser.application.length; j++){
                        var sinapp = sinuser.application[j];
                        if(appid === sinapp.applicationid) {
                            singleapp.push(sinapp);
                            break Loop1;
                        }
                    }
                }
                result.application = singleapp;
                if(singleapp.length > 0) {
                    res.json({
                        message: "Applications retrived Successfully",
                        code: 200,
                        data: result
                    });
                }else{
                    res.json({
                        message: "No applications found.",
                        code: 400
                    });
                }
            } else {
                res.json({
                    message: 'User details not found to retrieve applications',
                    code: 400
                });
            }
        }
    })
}else{
    User.find({},function(err,data){
        if(err) {
            res.send(err);
        }
        else {
            if (data !== "") {
                var allapps = [];
                for (var i=0 ; i<data.length; i++){
                    var oneuser = data[i];
                    for(var j=0 ; j<oneuser.application.length; j++){
                            var oneapp = oneuser.application[j];
                            allapps.push(oneapp);
                        }
                }
                if(allapps.length > 0) {
                    res.json({
                        message: "Applications retrived Successfully",
                        code: 200,
                        data: allapps
                    });
                }else{
                    res.json({
                        message: "No applications found.",
                        code: 400
                    });
                }
            } else {
                res.json({
                    message: 'User Records not found to retrieve applications',
                    code: 400
                });
            }
        }
    })
}
});


app.put('/authentication/leaveactions/',(req,res) => {
    var updateuserid = req.query.userid;
    var updateappid = req.query.id;
    var postdata = {
        reason: req.body.reason,
        content: req.body.content,
        applied_sl: req.body.applied_sl,
        applied_cl: req.body.applied_cl,
        applied_wfh: req.body.applied_wfh,
        status: req.body.status,
        comment: req.body.comment
    };
    if(updateuserid && updateappid) {
        User.findOne({_id: updateuserid}, function (err, data) {
            if (err) {
                res.json(err);
            }
            else {
                var result = data;
                if (result) {
                    for (var i=0 ; i < result.application.length; i++){
                        if ((updateappid === result.application[i].applicationid)) {
                            if((postdata.status === 'approved') && result.application[i].status !== 'approved'){
                                result . compcl = (result . compcl) + (postdata.applied_cl);
                                result . available_cl = (result . totalcl) - (result . compcl);
                                result . compsl = (result . compsl) + (postdata.applied_sl);
                                result . available_sl =  (result . totalsl) - (result . compsl);
                            }
                            result.application[i].status = req.body.status;
                            result.application[i].comment = req.body.comment;
                            result.application[i].reason = req.body.reason;
                            result.application[i].content = req.body.content;
                            //console.log(result);
                             User.updateOne({_id: updateuserid}, result, function(err, upres) {
                                if (err) {
                                    res.json(err);
                                }else{
                                    console.log(result);
                                    var mailOptions={
                                        to : result.email,
                                        reportto : result.reportto,
                                        subject : req.body.reason,
                                        content : req.body.comment,
                                        applied_sl: req.body.applied_sl,
                                        applied_cl: req.body.applied_cl,
                                        applied_wfh: req.body.applied_wfh,
                                        status: req.body.status,
                                    };
                                    sendEMail(mailOptions);
                                    res.json({
                                            message: "Updated Successfully and sent mail",
                                            code: 200,
                                            data: upres
                                    });
                                }
                            });
                            break;
                        }
                    }

                } else {
                    res.json({
                        message: 'Record with the given userid not found',
                        code: 400
                    });
                }
            }
        });
    }else{
        res.json({
            message: 'Please provide application id and user id',
            code: 400
        });
    }
});