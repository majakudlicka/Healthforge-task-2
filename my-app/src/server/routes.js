const express = require('express');
const router = express.Router();
const request = require('request');
const size = 100;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//Route for a specific patient
router.get('/patient/:id', function(req, res) {
  let url = `https://api.interview.healthforge.io/api${req.url}`;
  request(url, function(error, response, body) {
    if (error) {
      res.status(500).send('Something went wrong');
    } else {
      res.send(body);
    }
  });
});

// Route for all patients
router.get('/patient', function(req, res) {
  let url;
  // If a specific page is specified, grabs specific page from API, otherwise
  // grabs entire patients population. This is the demonstration of backend filtering
  // functionality and could be useful if, for example, data set grew bigger. (Now all
  // filtering is done on frontend)
  if (req.query.page) {
    let page = req.query.page;
    url = `https://api.interview.healthforge.io:443/api/secure/patient?size=10&page=${page}`;
  } else {
    url = `https://api.interview.healthforge.io:443/api/secure/patient?size=${size}`;
  }

  const options = {
    method: 'GET',
    url: url,
    auth: {
      bearer: req.query.token,
    },
    accept: 'application/json',
  };

  request(options, function(error, response, body) {
    console.log(response.Auth);
    console.log(body);
    if (error) {
      res.status(500).send('Something went wrong');
    } else {
      res.send(body);
    }
  });
});
//Route for all patients
// router.get('/patient', function(req, res) {
//   console.log('inside route');
//   let url;
//If a specific page is specified, grabs specific page from API, otherwise
//grabs entire patients population. This is the demonstration of backend filtering
//functionality and could be useful if, for example, data set grew bigger. (Now all
// filtering is done on frontend)
// if (req.query.page) {
//   let page = req.query.page;
//   url = `https://api.interview.healthforge.io:443/api/secure/patient?size=10&page=${page}`;
// } else {
//   url = `https://api.interview.healthforge.io:443/api/secure/patient?size=${size}`;
// }

//   url =
//     'https://auth.healthforge.io/auth/realms/interview/protocol/openid-connect/token';
//   request.post(
//     url,
//     {
//       form: {
//         grant_type: 'password',
//         client_id: 'interview',
//         username: 'interview',
//         password: 'Interview01',
//       },
//     },
//     function(error, response, body) {
//       console.log(response.status);
//       console.log(body);
//       if (error) {
//         res.status(500).send('Something went wrong');
//       } else {
//         res.send(body);
//       }
//     }
//   );
// });

module.exports = router;
