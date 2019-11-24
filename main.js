const get = require("simple-get")

async function register({
  registerHook,
  registerSetting,
  settingsManager
}) {
  // see https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do
  /* 
    Test Site key: 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
    Test Secret key: 6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
    They will always return a validated response, and will show a captcha with a warning
  */
  registerSetting({
    name: 'recaptcha-site-key',
    label: 'ReCaptcha Site Key',
    type: 'input',
    private: false
  })
  registerSetting({
    name: 'recaptcha-secret-key',
    label: 'ReCaptcha Secret Key',
    type: 'input',
    private: true
  })

  registerHook({
    target: "filter:api.user.signup.allowed.result",
    handler: (result, params) => verifyCaptcha(result, params, settingsManager)
  })
}

async function unregister() {
  return
}

module.exports = {
  register,
  unregister
}

async function verifyCaptcha (result, params, settingsManager) {
  // g-recaptcha-response is the key that browser will generate upon form submit.
  // if its blank or null means user has not selected the captcha, so return the error.
  if (!params.body["g-recaptcha-response"]) {
    return { allowed: false, errorMessage: "Captcha wasn't filled" }
  }

  const secretKey = await settingsManager.getSetting('recaptcha-secret-key')
  if (!secretKey) return result

  // params.connection.remoteAddress will provide IP address of connected user.
  const verificationUrl =
    "https://www.google.com/recaptcha/api/siteverify?secret=" +
    secretKey +
    "&response=" +
    params.body["g-recaptcha-response"] +
    "&remoteip=" +
    params.ip

  return get(verificationUrl, function (err, res, body) {
    body = JSON.parse(body)
    if (body.success !== undefined && !body.success) {
      return { allowed: false, errorMessage: "Wrong captcha" }
    }
    return result
  })
}
