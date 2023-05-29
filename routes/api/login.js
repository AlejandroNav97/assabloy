const router = require('express').Router();
const passport = require('passport');
const authController = require('../../controllers/authorizationController')
const config = require('../../config.json');

// Cognito functions
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoAccessToken = require('amazon-cognito-identity-js');
const CognitoIdToken = require('amazon-cognito-identity-js');
const CognitoRefreshToken = require('amazon-cognito-identity-js');

const UserPoolId = config.cognito.userPoolId;
const ClientId = config.cognito.clientId;
const userPool = new AmazonCognitoIdentity.CognitoUserPool({ UserPoolId, ClientId});

const userData = {
  Username: 'manuela.lopera@globant.com',
  Pool: userPool
};

const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

// '/api/login' route Using local strategy to redirect back if there is an error
router.post('/auth', authController.login);
router.route('/').post(passport.authenticate('local'), (req, res) => {
  res.status(200).json({ user: req.user })
});
router.post('/validate', authController.validate_token);

// '/api/login/status' route
router.route('/status').get((req, res) => {
  // Refresh token if expired
  // console.log('Credentials', JSON.parse(process.env.CREDENTIALS));
  if(authController.validate_token !== 'Valid token' && JSON.parse(process.env.CREDENTIALS)?.access_token)
  {
    const AccessToken = new AmazonCognitoIdentity.CognitoAccessToken({ AccessToken: JSON.parse(process.env.CREDENTIALS).access_token });
    const IdToken = new AmazonCognitoIdentity.CognitoIdToken({ IdToken: JSON.parse(process.env.CREDENTIALS).id_token });
    const RefreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({ RefreshToken: JSON.parse(process.env.CREDENTIALS).refresh_token });
  
    const sessionData = {
      IdToken: AccessToken,
      AccessToken: IdToken,
      RefreshToken: RefreshToken
    };
  
    const userSession = new AmazonCognitoIdentity.CognitoUserSession(sessionData);
    cognitoUser.setSignInUserSession(userSession); 
    cognitoUser.getSession(function (err, session) { 
      if (session && session.isValid()) {
        console.log('Session is valid');
        // Update attributes or whatever else you want to do
      } else {
        authController.login
      }
    });
  } else {
    authController.login
  }

  if (req.isAuthenticated()) {
    res.status(200).json({ user: req.user })
  } else {
    res.status(200).json({
      user: {
        access_id: 0,
        type: 'Guest',
        user_id: 0,
        username: 'guest'
      }
    })
  }
})
  
  module.exports = router
  