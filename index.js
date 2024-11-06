const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');

const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
  });
  
  // Register `hbs` as our view engine using its bound `engine()` function.
  app.engine('hbs', hbs.engine);
  app.set('view engine', 'hbs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(bodyParser.json());
  // set Session
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: true,
      resave: true,
    })
  );
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );


// -------------------------------------  register   ----------------------------------------------


  router.post('/register', async (req, res) => {
    const { firstName, lastName, email, username, password } = req.body;

    try {
        // 创建新用户实例
        const newUser = new User({
            firstName,
            lastName,
            email,
            username,
            password, // 密码应该进行加密处理
        });

        // 保存用户到数据库
        await newUser.save();

        // 成功后重定向到 /register2 或者返回成功信息
        res.redirect('/register2');
    } catch (error) {
        // 处理错误，可能是重复的用户名或电子邮件等
        res.status(500).send('Error during registration');
    }
});

// -------------------------------------  login   ----------------------------------------------

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // find user
        const user = await User.findOne({ username });
        if (!user)
        {
            return res.status(400).send('Invalid username or password');
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }

        // sucsess
        res.redirect('/dashboard'); // 假设重定向到用户仪表板页面
    } catch (error) {
        res.status(500).send('Error during login');
    }
});

// -------------------------------------  animal information page   ----------------------------------------------
router.get('/animal/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const animal = await Pet.findById(id);
        
        if (!animal) {
            return res.status(404).send('Animal not found');
        }
        res.render('animal-info', { animal });
    } catch (error) {
        res.status(500).send('Error retrieving animal information');
    }
});


// start surver
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});