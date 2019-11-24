import loadjs from "loadjs"

function register({ registerHook, peertubeHelpers }) {
  initRC(registerHook, peertubeHelpers).catch(err =>
    console.error("Cannot initialize recaptcha plugin", err)
  )
}

export { register }

function initRC(registerHook, peertubeHelpers) {
  return peertubeHelpers.getSettings().then(async s => {
    if (!s || !s["recaptcha-site-key"]) {
      console.error(
        "Recaptcha plugin lacks a site key set to use the ReCaptcha. Falling back to normal registration."
      )
      return
    }

    // add captcha to the first form (user form)
    const node = document.getElementsByTagName("form")[0]
    const div = document.createElement("div")
    div.setAttribute("class", "g-recaptcha")
    node.appendChild(div)

    // global callback definition is the most flexible way, since
    // loadjs's callback triggers too soon: immediately after the
    // resource load, when in fact api.js loads other resources
    // before it is defining grecaptcha.
    window.onReCaptchaLoadCallback = () => {
      grecaptcha.render(div, {
        callback: () =>
          (window.ReCaptchaLoadCallbackResponse = grecaptcha.getResponse()),
        sitekey: s["recaptcha-site-key"]
      })
    }
    loadjs(
      "https://www.google.com/recaptcha/api.js?onload=onReCaptchaLoadCallback&render=explicit"
    )

    registerHook({
      target: "filter:api.signup.registration.create.params",
      handler: body =>
        Object.assign({}, body, {
          "g-recaptcha-response": window.ReCaptchaLoadCallbackResponse
        })
    })
  })
}
