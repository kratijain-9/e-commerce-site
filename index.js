const express=require('express');
const app=express();
const ejsmate=require('ejs-mate');
app.engine('ejs',ejsmate);
const methodOverride = require('method-override');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost:27017/shopping-app-2')
    .then(() => console.log('DB Connected'))
    .catch((err) => console.log(err));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const productApis = require('./router/api/productapi');

const sessionConfig = {
    secret: 'asecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000* 60 * 60 * 24 * 7 * 1,
        maxAge:1000* 60 * 60 * 24 * 7 * 1
    }
}
app.use(session(sessionConfig));
app.use(flash());
// Initialising middleware for passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Telling the passport to check for username and password using authenticate method provided by the passport-local-mongoose package
passport.use(new LocalStrategy(User.authenticate())); 

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


const productrouter=require('./router/productroutes');
const reviewrouter=require('./router/reviewroutes');
const authRoutes = require('./router/auth');
app.use(authRoutes);
app.use(reviewrouter);
app.use(productrouter);
app.use(productApis);


app.listen(3000,()=>{
    console.log("again !");
})

app.get('/',(req,res)=>{
    res.send('hola');
})