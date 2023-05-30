const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');

const config = require('../config.json');

const pool_region = config.cognito.region;
const UserPoolId = config.cognito.userPoolId;
const ClientId = config.cognito.clientId;
const userPool = new AmazonCognitoIdentity.CognitoUserPool({ UserPoolId, ClientId});

const Auth = {
    login: (body, callback) => {
        const loginDetails = {
            Username: 'manuela.lopera@globant.com',
            Password:'lopera11'
          };
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(loginDetails);
         var userDetails = {
            Username: loginDetails.Username,
            Pool: userPool
         }
         var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails);
         cognitoUser.authenticateUser(authenticationDetails, {
             onSuccess: function (result) {
                var accesstoken = result.getAccessToken().getJwtToken();
                var credentials = {
                    access_token: result.accessToken.jwtToken,
                    id_token: result.idToken.jwtToken,
                    refresh_token: result.refreshToken.token
                }; 
                process.env.CREDENTIALS = JSON.stringify(credentials);
                callback(null, accesstoken);
             },
             onFailure: (function (err) {
                callback(err);
            })
        })
     },
     validate: (token, callback) => {
        request(
            {
                url : `https://cognitoidp.${pool_region}.amazonaws.com/${UserPoolId}/.well-known/jwks.json`,
                json : true
            }, function(error, response, body){
            if (!error && response.statusCode === 200) {
                pems = {};
                var keys = body['keys'];
                for(var i = 0; i < keys.length; i++) {
                        var key_id = keys[i].kid;
                        var modulus = keys[i].n;
                        var exponent = keys[i].e;
                        var key_type = keys[i].kty;
                        var jwk = { kty: key_type, n: modulus, e: exponent};
                        var pem = jwkToPem(jwk);
                        pems[key_id] = pem;
                }
                var decodedJwt = jwt.decode(token, {complete: true});
                        if (!decodedJwt) {
                            console.log("Not a valid JWT token");
                            callback(new Error('Not a valid JWT token'));
                        }
                        var kid = decodedJwt.header.kid;
                        var pem = pems[kid];
                        if (!pem) {
                            console.log('Invalid token');
                            callback(new Error('Invalid token'));
                        }
                    jwt.verify(token, pem, function(err, payload) {
                            if(err) {
                                console.log("Invalid Token.");
                                callback(new Error('Invalid token'));
                            } else {
                                console.log("Valid Token.");
                                callback(null, "Valid token");
                            }
                    });
            } else {
                    console.log("Error! Unable to download JWKs");
                    callback(error);
            }
        });
    }
}

module.exports = Auth