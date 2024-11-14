// ********************** Initialize server **********************************

const server = require('../index'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

describe('Testing Register User API', () => {
  it('positive: /register with valid data', done => {
    chai
      .request(server)
      .post('/register')
      .send({
        'first-name': 'John',
        'last-name': 'Doe',
        email: 'johndoe@example.com',
        username: 'johndoe',
        password: 'password123'
      })
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming successful registration redirects with status 200
        done();
      });
  });
});

it('positive: /register with valid data from insert', done => {
  chai
    .request(server)
    .post('/register')
    .send({
      'first-name': 'Richart',
      'last-name': 'Dobbyn',
      email: 'rdobbyn0@springer.com',
      username: 'rdobbyn0',
      password: 'fortnite' // Assuming the password is provided in plain text for registration
    })
    .end((err, res) => {
      expect(res).to.have.status(200); // Assuming successful registration redirects with status 200
      done();
    });
  it('negative: /register with missing fields', done => {
    chai
      .request(server)
      .post('/register')
      .send({
        'first-name': 'Jane',
        'last-name': 'Smith',
        // Missing email, username, and password fields
      })
      .end((err, res) => {
        expect(res).to.have.status(400); // Expecting 400 status for bad request
        expect(res.text).to.include('All fields are required.'); // Check for specific error message in response
        done();
      });
  });
});


// ********************************************************************************

// ******************** TODO: WRITE 2 ADDITIONAL TESTCASES ************************

describe('Profile Route Tests', () => {
  let agent;
  const testUser = {
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    password: 'testpass123',
    email: 'testuser@colorado.edu',
  };

  before(async () => {
    // Clear users table and create test user
    await db.query('TRUNCATE TABLE users CASCADE');
    const hashedPassword = await bcryptjs.hash(testUser.password, 10);
    await db.query('INSERT INTO users (username, first_name, last_name, password_hash, email) VALUES ($1, $2. $3, $4, $5)', [
      testUser.username,
      testUser.first_name,
      testUser.last_name,
      hashedPassword,
      testUser.email,
    ]);
  });

  beforeEach(() => {
    // Create new agent for session handling
    agent = chai.request.agent(app);
  });

  afterEach(() => {
    // Clear cookie after each test
    agent.close();
  });

  after(async () => {
    // Clean up database
    await db.query('TRUNCATE TABLE users CASCADE');
  });

  describe('GET /profile', () => {
    it('should return 401 if user is not authenticated', done => {
      chai
        .request(app)
        .get('/profile')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.text).to.equal('Not authenticated');
          done();
        });
    });

    it('should return user profile when authenticated', async () => {
      // First login to get session
      await agent.post('/login').send(testUser);

      // Then access profile
      const res = await agent.get('/profile');

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('username', testUser.username);
    });
  });
});