const request = require('supertest');
const app = require('../server/app.js', {bustCache: true});

//In case of slow API response
jest.setTimeout(30000);

//Testing the routes -> as per individual test descriptions

describe('Test the root path', () => {
  test('It should response with 200 status code', done => {
    request(app).get('/patient').query({token: '123'}).then(response => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });

  test('Test that cross-origin headers have been applied correctly', done => {
    request(app).get('/patient').then(response => {
      expect(response.headers['access-control-allow-headers']).toBe(
        'Origin, X-Requested-With, Content-Type, Accept'
      );
      expect(response.headers['access-control-allow-origin']).toBe('*');
      done();
    });
  });

  test('Test that the reponse is a JSON string', done => {
    request(app).get('/patient').query({token: '123'}).then(response => {
      expect(typeof response.text).toBe('string');
      done();
    });
  });

  test('Test that the response includes unathorised status code - because the token is not correct', done => {
    request(app).get('/patient').query({token: '123'}).then(response => {
      expect(JSON.parse(response.text).status).toBe(401);
      done();
    });
  });
});

describe('Test that server returns 404 for unknown routes', () => {
  test('It should response with 404 status code', done => {
    request(app).get('/something').then(response => {
      expect(response.statusCode).toBe(404);
      done();
    });
  });
});

describe('Test the patient/id route', () => {
  test('It should response with 200 status code', done => {
    request(app)
      .get('/patient/24207334065940285913')
      .query({token: '123'})
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });

  test('Test that the parsed body is an object', done => {
    request(app)
      .get('/patient/24207334065940285913')
      .query({token: '123'})
      .then(response => {
        expect(typeof JSON.parse(response.text)).toBe('object');
        done();
      });
  });
});
