let express = require('express');
let    bodyParser = require('body-parser');
let    morgan = require('morgan');
let    jwt    = require('jsonwebtoken');
let    config = require('./config');
let    app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
let mongoose = require("mongoose");
let uniqueValidator = require('mongoose-unique-validator');
let Validator = require('schema-validator');
let MongoClient =    require('mongodb').MongoClient;
    //mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost:27017/Accounts",{ useNewUrlParser: true , useCreateIndex: true } );
let db = mongoose.connection;
var bcrypt = require('bcrypt-nodejs');


//set secret
app.set('Secret', config.secret);

// use morgan to log requests to the console
app.use(morgan('dev'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.listen(3000,()=>{

    console.log('server is running on port 3000')

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
    password: {
        type: "string",
        required: true,
        description: "required and must be a string",

    },
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


//Collection name
var User = mongoose.model("Users", nameSchema);

app.get('/', function(req, res) {
    res.send('App server is running on http://localhost:3000/');
});
app.post("/authentication/createuser",function(req,res){
    var u = new User({
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        username:req.body.username,
        email:req.body.email,
    });

    u.password = u.generateHash(req.body.password);

    u.save(function(err){
        if(err)
            res.send(err);
        else
            res.send("Successfully inserted");
    });

});
app.get("/authentication/getuser/",function(req,res){
    var limitdata = req.query.limit ? JSON.parse(req.query.limit):"";
    var skipdata = req.query.skip ? JSON.parse(req.query.skip) : "";
    if(req.query.email){
        User.findOne({email:req.query.email},function(err,data){
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
        User.findOne({username:req.query.username},function(err,data){
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

app.put("/authentication/updateuser",function(req,res){
    var updateemail = req.query.email;
    var updateusername = req.query.username;

    if(updateemail) {
        User.findOne({email: updateemail}, function (err, data) {
            if (err) {
                res.json(err);
            }
            else {
                var result = data;
                if(result){
                    result.firstname = req.body.firstname;
                    result.lastname = req.body.lastname;
                    result.username = req.body.username;
                    result.email = req.body.email;
                    result.save(function (err, docs) {
                        if (err)
                            res.send(err);
                        else
                            res.send(docs);
                    });
                } else {
                    res.json({
                        message: 'Record with the given email not found',
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
                    result.firstname = req.body.firstname;
                    result.lastname = req.body.lastname;
                    result.username = req.body.username;
                    result.email = req.body.email;
                    result.save(function (err, docs) {
                        if (err)
                            res.send(err);
                        else
                            res.send(docs);
                    });
                } else {
                    res.json({
                        message: 'Record with the given username not found',
                    });
                }
            }
        });
    } else {
        res.json({
            message: 'Please provide username / email',
        });
    }
});

app.delete("/authentication/deleteuser",function(req,res){
    var deleteemail = req.query.email;
    var deleteusername = req.query.username;
    if(deleteemail) {
        User.remove({email: deleteemail}, function (err, data) {
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
        User.remove({username: deleteusername}, function (err, data) {
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
        User.find({username:qusername},function(err,data){
            if(err) {
                res.send(err);
            }
            else {
                var result = data[0];
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
                                    token: token
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
        User.find({email:qemail},function(err,data){
            if(err) {
                res.send(err);
            }
            else {
                var result = data[0];
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
                            token: token
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


