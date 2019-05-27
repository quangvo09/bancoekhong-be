
var crypto = require('crypto-js');
var { savePredict, getPredict } = require('./db');
const array = [
  'Ê sắc nha bợn....',
  'Đào hoa thế cơ mà!',
  'Tui chịu thua...',
  'Có trời mà biết...'
];

const predict = function (playerId) {
  let p = getPredict(playerId);
  if (!!p) return p;

  const index = Math.round(Math.random() * array.length);
  const message = array[index];
  
  p = { playerId, message };
  savePredict(p);
  return p;
}

module.exports = function (app) {
  app.post('/get-predict', function (request, response) {
    var playerId = request.body.playerId;
    var signature = request.body.signature;

    // Validate request data
    // (see FBInstant.player.getSignedPlayerInfo documentation)
    var isValid = validate(signature);

    if (isValid) {
      // Retrieves the context Id from encoded signature payload
      var p = predict(playerId);
      response.json({
        'success': true,
        'playerId': playerId,
        'empty': false,
        'data': p
      });
    } else {
      // Returns a json with success:false and invalid signature
      // in case signature couldn't be verified
      // Invalid signature errors can happen for many reasons, like:
      //  - APP_SECRET not specified on .env
      //  - Request being sent from the mock SDK
      //   (set USE_SECURE_COMMUNICATION=true to use the mock SDK,
      //   otherwise use the embedded player)
      response.json({
        'success': false,
        'error': {message: 'invalid signature'}
      });
    }
  });
 
  /**
     * Validates a signed request, returning a boolean
     * See FBInstant.player.getSignedPlayerInfo for more information
     */
  const validate = function (signedRequest) {
    // You can set USE_SECURE_COMMUNICATION=false
    // in the .env file to bypass validation
    // while doing local testing and using the FBInstant mock SDK.
    if (process.env.USE_SECURE_COMMUNICATION === true) {
      console.log('Not validating signature');
      return true;
    }

    try {
      var firstpart = signedRequest.split('.')[0];
      var replaced = firstpart.replace(/-/g, '+').replace(/_/g, '/');
      var signature = crypto.enc.Base64.parse(replaced).toString();
      const dataHash =
        crypto.HmacSHA256(signedRequest.split('.')[1], process.env.APP_SECRET)
        .toString();
      var isValid = signature === dataHash;
      if (!isValid) {
        console.log('Invalid signature');
        console.log('Expected', dataHash);
        console.log('Actual', signature);
      }

      return isValid;
    } catch (e) {
      return false;
    }
  };

  /**
     * Gets payload data encoded into a signed request.
     * See FBInstant.player.getSignedPlayerInfo for more information
     */
  const getEncodedData = function (signedRequest) {
    // You can set USE_SECURE_COMMUNICATION=false
    //  in the .env file to bypass validation
    // while doing local testing and using the FBInstant mock SDK.
    if (process.env.USE_SECURE_COMMUNICATION === false) {
      return signedRequest;
    }

    try {
      const json =
        crypto.enc.Base64.parse(signedRequest.split('.')[1])
        .toString(crypto.enc.Utf8);
      const encodedData = JSON.parse(json);

      /*
            Here's an example of encodedData can look like
            {
                algorithm: 'HMAC-SHA256',
                issued_at: 1520009634,
                player_id: '123456789',
                request_payload: 'backend_save'
            }
            */
      return encodedData.request_payload;
    } catch (e) {
      return null;
    }
  };
};
