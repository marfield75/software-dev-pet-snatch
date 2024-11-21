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
const multer = require('multer');
const fs = require('fs');

var LoggedIn = 1;

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../src/resources/img/');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

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
app.use(express.static('src/resources/img'));
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
app.get('/welcome', (req, res) => {
    res.json({ status: 'success', message: 'Welcome!' });
});

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

app.get('/payment', (req, res) => {
    res.render('pages/payment');
});



app.get('/home', async (req, res) => {
    var message = "";
    if (LoggedIn === 0) {
        message = "Successfully Logged Out";
        LoggedIn = 1;
    }
    const query = 'SELECT * FROM pets;';
    db.any(query)
        .then(data => {
            // still figuring out how to use each to display all cards
            res.render('pages/home', { pet: data, message: message });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/home');
        });
});
app.get('/search', (req, res) => {
    res.render('pages/search')
});

app.get('/profile', async (req, res) => {
    try {
        const userId = req.session.user.id; // Get the user ID from the session
        const userData = await getUserData(userId); // Fetch user data using user ID

        if (!userData) {
            return res.status(404).send('User not found');
        }

        // Render the profile page with user data
        res.render('pages/profile', { user: userData });
    } catch (error) {
        console.error('Error retrieving profile information:', error);
        res.status(500).send('Error retrieving profile information');
    }
});

//update profile route
app.get('/editProfile', async (req, res) => {
    try {
        const userId = req.session.user.id; // Get the user ID from the session
        const userData = await getUserData(userId); // Fetch user data using user ID

        if (!userData) {
            return res.status(404).send('User not found');
        }

        // Render the edit profile page with user data
        res.render('pages/editProfile', { user: userData });
    } catch (error) {
        console.error('Error retrieving edit profile information:', error);
        res.status(500).send('Error retrieving edit profile information');
    }
});

app.post('/updateProfile', auth, async (req, res) => {
    const { username, email, password } = req.body;
    const userId = req.session.user.id;

    try {
        if (!username || !email) {
            return res.status(400).json({ success: false, message: 'Username and email are required.' });
        }

        let query, params;

        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            query = 'UPDATE users SET username = $1, email = $2, password_hash = $3 WHERE id = $4';
            params = [username, email, passwordHash, userId];
        } else {
            query = 'UPDATE users SET username = $1, email = $2 WHERE id = $3';
            params = [username, email, userId];
        }

        await db.none(query, params);

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
});

async function getUserData(userId) {
    try {
        // Query to fetch user information along with their pets based on user ID
        const query = `
            SELECT u.username, u.first_name, u.last_name, u.email,
                   p.id AS pet_id, p.name AS pet_name, p.class, p.breed, p.age, p.color,
                   p.weight, p.birthday, p.eye_color, p.location, p.bio, p.image_url
            FROM users u
            LEFT JOIN users_to_pets up ON u.id = up.user_id
            LEFT JOIN pets p ON up.pet_id = p.id
            WHERE u.id = $1
        `;

        // Execute the query with userId
        const result = await db.any(query, [userId]);

        if (result.length === 0) {
            throw new Error('User not found');
        }

        // Build the user object based on query result
        const user = {
            username: result[0].username,
            first_name: result[0].first_name,
            last_name: result[0].last_name,
            email: result[0].email,
            pets: result
                .filter(row => row.pet_id) // Only include rows with pet data
                .map(pet => ({
                    id: pet.pet_id,
                    name: pet.pet_name,
                    class: pet.class,
                    breed: pet.breed,
                    age: pet.age,
                    color: pet.color,
                    weight: pet.weight,
                    birthday: pet.birthday,
                    eye_color: pet.eye_color,
                    location: pet.location,
                    bio: pet.bio,
                    image_url: pet.image_url
                }))
        };

        return user;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

// POST route for handling registration form submission
app.post('/register', async (req, res) => {
    const { 'first-name': firstName, 'last-name': lastName, email, username, password } = req.body;

    if (!firstName || !lastName || !email || !username || !password) {
        return res.status(400).render('pages/register', { error: 'All fields are required.' });
    }

    // Log the request body (excluding the password for security)
    const safeBody = { ...req.body };
    delete safeBody.password;
    console.log('Received registration data:', safeBody);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (username, first_name, last_name, password_hash, email) 
            VALUES ($1, $2, $3, $4, $5);
        `;
        const newUser = await db.none(query, [username, firstName, lastName, hashedPassword, email]);
        res.redirect('/login');
    } catch (err) {
        if (err.constraint === 'users_username_key') {
            console.error('Username already exists.');
            res.status(400).render('pages/register', { error: 'Username already taken.' });
        } else if (err.constraint === 'users_email_key') {
            console.error('Email already exists.');
            res.status(400).render('pages/register', { error: 'Email already registered.' });
        } else {
            console.error('Error during registration:', err);
            res.status(500).render('pages/register', { error: 'Registration failed. Please try again.' });
        }
    }
});

app.post('/register2', upload.single('petImage'), async (req, res) => {
    const {
        petName, petClass, petAge, petColor, petWeight,
        petBreed, petEyecolor, petBirthday, petBio,
        petLoc, petPrice
    } = req.body;

    const petImage = req.file ? req.file.filename : null;
    const userId = req.session.user?.id;

    if (!userId) {
        return res.status(401).redirect('/login'); // Ensure user is logged in
    }

    if (!petName || !petClass || !petAge || !petColor || !petWeight || !petBreed ||
        !petEyecolor || !petBirthday || !petBio || !petLoc || !petPrice || !petImage) {
        return res.render('pages/register2', { error: 'All fields are required.' });
    }

    try {
        const query = `
            INSERT INTO pets (name, class, breed, age, color, weight, birthday, eye_color, location, bio, price, image_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id;
        `;
        const newPet = await db.none(query, [petName, petClass, petBreed, petAge, petColor, petWeight, petBirthday, petEyecolor, petLoc, petBio, petPrice, petImage]);
        res.redirect('/profile');
    } catch (err) {
        console.error('Error during pet registration:', err);
        res.render('pages/register2', { error: 'Pet registration failed. Please try again.' });
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Log the incoming request body (excluding the password for security)
    const safeBody = { ...req.body };
    delete safeBody.password;
    console.log('Login request body:', safeBody);

    try {
        const query = 'SELECT * FROM users WHERE username = $1';
        const user = await db.oneOrNone(query, [username]);

        if (!user) {
            console.log('No user found with username:', username);
            return res.render('pages/login', { error: 'Incorrect username or password.' });
        }

        // Log found user details (excluding password for security)
        console.log('User found:', { id: user.id, username: user.username });

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            console.log('Password does not match for user:', username);
            return res.render('pages/login', { error: 'Incorrect username or password.' });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
        };
        await req.session.save();
        res.redirect('/home');
    } catch (err) {
        console.error('Login error:', err);
        res.render('pages/login', { error: 'An error occurred. Please try again.' });
    }
});

app.get('/pet', async (req, res) => {
    const query = 'SELECT * FROM pets LIMIT 1;';
    db.any(query)
        .then(data => {
            const userData = getUserData(data[0].id);
            res.render('pages/pet', { pet: data[0], user: userData});
        })
        .catch(err => {
            console.log(err);
            res.redirect('/home');
        });
});

app.get('/cart', async (req, res) => {
    try {
        // get user id
        const userId = req.session.user.id;
        if (!userData) {
            return res.status(404).send('User not found');
        }

        // select all pets in that user's cart
        const query = 'SELECT p.* FROM pets p JOIN cart c ON p.pet_id = c.pet_id WHERE c.user_id = $1;';
        pets_in_cart = await db.none(query, [userId]);

        // render the page with the pets in the cart
        res.render('pages/cart', { pets: pets_in_cart });
    } catch (error) {
        console.error('Error retrieving cart information:', error);
        res.status(500).send('Error retrieving cart information');
    }
});

app.get('/logout', (req, res) => {
    // Destroy the user session
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Something went wrong.");
        }
        LoggedIn = 0;
        // Redirect to the home page with a query parameter for the logout message
        res.redirect('/home');
    });
});


const auth = (req, res, next) => {
    if (!req.session.user) {
        // Store the original URL to redirect after login
        req.session.redirectAfterLogin = req.originalUrl;
        return res.redirect('/login');
    }
    next();
};

// Authentication Required
app.use(auth);

app.get('/profile', async (req, res) => {
    try {
        const userId = req.session.user.id; // Get the user ID from the session
        const userData = await getUserData(userId); // Fetch user data using user ID

        if (!userData) {
            return res.status(404).send('User not found');
        }

        // Render the profile page with user data
        res.render('pages/profile', { user: userData });
    } catch (error) {
        console.error('Error retrieving profile information:', error);
        res.status(500).send('Error retrieving profile information');
    }
});

app.get('/editProfile', async (req, res) => {
    try {
        const userId = req.session.user.id; // Get the user ID from the session
        const userData = await getUserData(userId); // Fetch user data using user ID

        if (!userData) {
            return res.status(404).send('User not found');
        }

        // Render the edit profile page with user data
        res.render('pages/editProfile', { user: userData });
    } catch (error) {
        console.error('Error retrieving edit profile information:', error);
        res.status(500).send('Error retrieving edit profile information');
    }
});

async function getUserData(userId) {
    try {
        // Query to fetch user information along with their pets based on user ID
        const query = `
            SELECT u.username, u.first_name, u.last_name, u.email,
            p.id AS pet_id, p.name AS pet_name, p.class, p.breed, p.age, p.color,
            p.weight, p.birthday, p.eye_color, p.location, p.bio, p.image_url
            FROM users u
            LEFT JOIN user_uploads up ON u.id = up.user_id
            LEFT JOIN pets p ON up.pet_id = p.id
            WHERE u.id = $1

        `;

        // Execute the query with userId
        const result = await db.any(query, [userId]);

        if (result.length === 0) {
            throw new Error('User not found');
        }

        // Build the user object based on query result
        const user = {
            username: result[0].username,
            first_name: result[0].first_name,
            last_name: result[0].last_name,
            email: result[0].email,
            pets: result
                .filter(row => row.pet_id) // Only include rows with pet data
                .map(pet => ({
                    id: pet.pet_id,
                    name: pet.pet_name,
                    class: pet.class,
                    breed: pet.breed,
                    age: pet.age,
                    color: pet.color,
                    weight: pet.weight,
                    birthday: pet.birthday,
                    eye_color: pet.eye_color,
                    location: pet.location,
                    bio: pet.bio,
                    image_url: pet.image_url
                }))
        };

        return user;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');