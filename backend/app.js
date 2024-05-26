require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const device = require("express-device");
const bodyParser = require("body-parser");
const requestIp = require("request-ip");
const mongoose = require("mongoose");
const mongoURI = process.env.mongoURI;

const app = express();

app.use(logger("dev"));
app.use(device.capture());

app.use(
    bodyParser.json({
        limit: '50mb'
    })
)

app.use(
    bodyParser.urlencoded({
        limit: '50mb',
        extended: false
    })
)

mongoose.Promise = global.Promise;

Promise.resolve(app)
    .then(MongoDBConnection())
    .catch(err => console.error.bind(console, `MongoDB connection error: ${JSON.stringify(err)}`));

async function MongoDBConnection() {
    console.log(`| MongoDB URL  : ${mongoURI}`);
    await mongoose
        .connect(mongoURI)
        .then(() => {
            console.log('| MongoDB Connected');
            console.log('|--------------------------------------------');
            // SettingInitiate();
        });

    return null;
}

// async function SettingInitiate() {
//     await initSettings().then(() => {
//         const auth = require('./helper/auth.helper');
//         auth(passport);
//         // Passport Config
//         require('./helper/passport.helper')(passport);
//     });
//     return null;
// }

app.use(function (req, res, next) {
    req.client_ip_address = requestIp.getClientIp(req);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'DELETE, GET, POST, PUT, PATCH');
    next();
});

app.use((err, req, res, next) => {
    if (err.status === 404) {
        return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, err, 'Route Not Found', null);
    } else {
        console.log('\x1b[41m', err);
        let path = req.baseUrl + req.route && req.route.path;
        if (path.substr(path.length - 1) === '/') {
            path = path.slice(0, path.length - 1);
        }
        err.method = req.method;
        err.path = req.path;
        AddErrorToLogs(req, res, next, err);
        return otherHelper.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, false, null, err, null, null);
    }
});

module.exports = app;