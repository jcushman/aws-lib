exports.init = function(genericAWSClient) {
  // Creates an FPS API client
  var createFPSClient = function (accessKeyId, secretAccessKey, options) {
    options = options || {};

    var client = fpsClient({
      host: options.host || "fps.sandbox.amazonaws.com", // use fps.amazonaws.com for live site
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure,
      version: options.version
    });
    return client;
  }
  // Amazon FPS API handler which is wrapped around the genericAWSClient
  var fpsClient = function(obj) {
    var aws = genericAWSClient({
      host: obj.host, path: obj.path, accessKeyId: obj.accessKeyId,
      secretAccessKey: obj.secretAccessKey, secure: obj.secure
    });
    obj.call = function(action, query, callback) {
      query["Action"] = action
      query["Version"] = obj.version || '2010-08-28'
      query["SignatureMethod"] = "HmacSHA256"
      query["SignatureVersion"] = "2"
      return aws.call(action, query, callback);
    }
    return obj;
  }
  return createFPSClient;
}