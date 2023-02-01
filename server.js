const express = require("express")
const app = express()
const favicon = require('serve-favicon')
const dotenv = require("dotenv")
const helmet = require("helmet")
const cors = require("cors")
const morgan = require("morgan")
const expressLayouts = require("express-ejs-layouts");
const path = require("path")
const connectDB = require("./server/database/connection")
const fileUpload = require("express-fileupload");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo")
const flash = require("connect-flash");
const passport = require("passport")
const initialize = require("./server/services/passport")


// load config file
dotenv.config({path: './config/config.env'})
connectDB()

const PORT = process.env.PORT || 5000



// load passport
initialize(passport)

// load middlewares

app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

app.use(cors())
app.use(morgan("tiny"))
app.use(express.json())

// file uploads
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true,
    limits: {
      fileSize: 1024 * 1024 * 20
    },
  })
);



// set view engine
app.use(expressLayouts);
app.set("layout", "../layouts/layout");
app.set("view engine", "ejs")
app.set("views", path.resolve(__dirname, "views/pages" ))

// load body parser
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));

app.use(
  session({
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    secret: process.env.SESSION_SECRETE,
    resave: false,
    saveUninitialized: false,
  })
);

// passport Middlewares
app.use(passport.initialize())
app.use(passport.session())

// connect flash 
app.use(flash())

// set global variables for flash messages
app.use((req, res, next)=>{
 res.locals.success_msg = req.flash('success_msg')
 res.locals.error_msg = req.flash("error_msg");
 res.locals.error = req.flash('error')
 res.locals.user = req.user
 next()
})

// load static files
app.use('/css', express.static(path.resolve(__dirname, "node_modules/bootstrap/dist/css")))
app.use('/js', express.static(path.resolve(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.resolve(__dirname, 'node_modules/jquery/dist')))


app.use('/js', express.static(path.resolve(__dirname, 'node_modules/sweetalert2/dist')))
app.use('/css', express.static(path.resolve(__dirname, 'node_modules/sweetalert2/dist')))


app.use('/css', express.static(path.resolve(__dirname, './public/css')))
app.use('/js', express.static(path.resolve(__dirname, './public/js')))
app.use('/img', express.static(path.resolve(__dirname, './public/img')))
app.use('/img', express.static(path.resolve(__dirname, './public/img')))
app.use(favicon(path.join(__dirname, "public", "img", "favicon.ico")));





app.get("/", (req, res)=>{
    res.render("Home2",{
        title: "Revolution Plus Client's Portal"
    })
})

// APIs
app.use("/api/v2/secure", require('./server/routes/auth'))
app.use("/api/v2/reset", require('./server/routes/password'))
app.use("/api/v2/index", require("./server/routes/indexRoutes"))
app.use("/api/v2/customers", require("./server/routes/customer"))
app.use("/api/v2/properties", require("./server/routes/property"))
app.use("/api/v2/statutories", require("./server/routes/statutory"))
app.use("/api/v2/users", require("./server/routes/user"))
app.use("/api/v2/assign", require("./server/routes/assign"))
app.use("/api/v2/stats", require("./server/routes/statistics"));
app.use('/', require('./server/routes/emailing'))
app.use('/', require('./server/routes/excelhandler'))
// app.use('/', require('./server/routes/dataexporter'))
app.use((req, res)=>{
 res.render('errors/404', {
   title: 'Page not Found',
   user: req.user
 })
})



app.listen(PORT, ()=>{
    console.log(`Server Running on http://localhost:${process.env.PORT}`)
})