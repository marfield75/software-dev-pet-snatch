// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
});

// database configuration
const dbConfig = {
    host: 'db', // the database server
    port: 5432, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
    .then(obj => {
        console.log('Database connection successful'); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static('src/pictures'));
app.use(express.static('src/resources/css'));
// initialize session variables
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
    })
);

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.get('/register', (req, res) => {
    res.render('pages/register');
});

app.get('/register2', (req, res) => {
    res.render('pages/register2');
});


app.get('/home', (req, res) => {
    res.render('pages/home');
});

app.get('/home', (req, res) => {
    res.render('pages/profile')
});

// POST route for handling registration form submission
app.post('/register', async (req, res) => {
    const name = await req.body.username;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *;';
    db.oneOrNone(query, [name, hashedPassword])
        .then(data => {
            res.redirect('/login');
        })
        .catch(err => {
            res.redirect('/register');
        });
});

app.post('/login', async (req, res) => {

    // Find the user from the database
    const query = 'SELECT * FROM users WHERE username = $1';
    db.oneOrNone(query, req.body.username)
        .then(async data => {
            user.username = data.username;
            user.password = data.password;

            const match = await bcrypt.compare(req.body.password, user.password);

            if (!match) {
                // If password doesn't match, render login page with error message
                res.render('pages/login', { error: 'Incorrect username or password.' });
            } else {
                req.session.user = user;
                req.session.save();
                res.redirect('/discover');
            }
        })
        .catch(err => {

            res.redirect('/register');
        });
});
// Authentication Middleware.
const auth = (req, res, next) => {
    if (!req.session.user) {
        // Default to login page.
        return res.redirect('/login');
    }
    next();
};

// Authentication Required
app.use(auth);

app.get('/pet', async (req, res) => {
    const query = 'SELECT * FROM pets;';
    db.any(query)
        .then(data => {
            res.render('pages/pet', { pets: data });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/home');
        });
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');