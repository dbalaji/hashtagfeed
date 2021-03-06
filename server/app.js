
const path  = require('path');

const express   = require('express'),
    logger      = require('morgan'),
    bodyParser  = require('body-parser'),
    async       = require('async'),
    ejs         = require('ejs');

const DEFAULT_PORT  = 3000;
const VIEWS_DIR     = path.join(__dirname, "./views");
const STATIC_DIR    = path.join(__dirname, "../client");
const CONFIG_FILE   = path.join(__dirname, "../config/main.json");
const PKG_JSON_FILE = path.join(__dirname, "../", "package.json");

/**
 * @description : creates, initializes express app
 * @param done_cb : Completion callback, err, app are the arguments
 */
module.exports= function(done_cb) {

    var app = express();

    app.locals.cfg= require(CONFIG_FILE);
    app.locals.pkg_info= require(PKG_JSON_FILE);

    app.set("port", DEFAULT_PORT);

    //app.use(logger('combined'))
    app.use(bodyParser.json({limit:"2mb"}));
    app.use(bodyParser.urlencoded({limit:"2mb", extended: false }));

    // view engine setup
    app.set('views', VIEWS_DIR);
    app.engine('ejs', ejs.renderFile);
    app.set('view engine', 'ejs');

    app.use(express.static(STATIC_DIR));

    // Initialize Routes for pages, api and errors
    require("./routes/pages")(app);
    require("./routes/api")(app);
    require("./routes/error")(app);

    var boot_steps= [
        "models",
        "services",
    ];

    var initialize= function (step, next) {
        require("./"+step)(app, next);
    };

    async.eachSeries(boot_steps, initialize, function (err) {
        done_cb(err, app);
    });
};

