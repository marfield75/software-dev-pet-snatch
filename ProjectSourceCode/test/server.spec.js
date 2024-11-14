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
      .end((_, res) => {
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
      .end((_, res) => {
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

describe('Testing Login User API', () => {
  it('positive: /login with valid data', done => {
    chai
      .request(server)
      .post('/login')
      .send({
        username: 'johndoe',
        password: 'password123'
      })
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming successful login redirects with status 200
        done();
      });

  });

  it('negative: /login with invalid data', done => {
    chai
      .request(server)
      .post('/login')
      .send({
        username: 'johndoe',
        password: 'wrongpassword'
      })
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming login attempt redirects with status 200
        done();
      });
  })
});