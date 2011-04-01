var qs = require("querystring");

exports.init = function(genericAWSClient) {
  // Creates an FPS API client
  var createFPSClient = function (accessKeyId, secretAccessKey, options) {
    options = options || {};
  options.area = options.area == "live" ? "live" : "sandbox";
  var urls = {
    "live" : {
      "action": {"host" : "fps.amazonaws.com", "path":"/"},
      "service": {"host" : "authorize.payments.amazon.com", "path":"/cobranded-ui/actions/start"}
    },
    "sandbox" : {
      "action": {"host" : "fps.sandbox.amazonaws.com", "path":"/"},
      "service": {"host" : "authorize.payments-sandbox.amazon.com", "path":"/cobranded-ui/actions/start"}
    }
  }
    var client = {
    "action" : fpsClient({
              host: options.action_host || urls[options.area].action.host,
              path: options.action_path || urls[options.area].action.path,
              accessKeyId: accessKeyId,
              secretAccessKey: secretAccessKey,
              secure: options.secure,
              version: options.action_version
            }),
    "service" : fpsClient({
              host: options.service_host || urls[options.area].service.host,
              path: options.service_path || urls[options.area].service.path,
              accessKeyId: accessKeyId,
              secretAccessKey: secretAccessKey,
              secure: options.secure,
              version: options.service_version,
              cobrandingUrl: options.cobrandingUrl,
              websiteDescription: options.websiteDescription
            })
  };
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
      query["Version"] = obj.action_version || '2010-08-28'
      query["SignatureMethod"] = "HmacSHA256"
      query["SignatureVersion"] = "2"
      return aws.call(action, query, callback);
    }
    obj.signed_service_url = function(query, callback) {
      query["callerKey"] = query["callerKey"] || obj.accessKeyId;
      query["signatureMethod"] = "HmacSHA256";
      query["signatureVersion"] = "2";
      query["version"] = obj.service_version || "2009-01-09";
      query["cobrandingUrl"] = query["cobrandingUrl"] || obj.cobrandingUrl;
      query["websiteDescription"] = query["websiteDescription"] || obj.websiteDescription;
      query["signature"] = aws.sign(query, "GET");
      return "https://"+obj.host+obj.path+"?"+qs.stringify(query);
    }
    return obj;
  }
  return createFPSClient;
}