/* Browser testing emails need to bypass the google recaptcha */

/**
 * Validator for emails that should not be challenged with the recaptcha
 */
export function isBrowserTestEmail(source?: string | null) {
  if (!source) return false;

  // https://regex101.com/r/MZpStl/4
  const emailRegex =
    /^cr7-s4d-sxq\.[0-9]{10,19}@synthetics.dtdg.co$|^acceptance-test(\+\S+)?@magic.link$|^magic\+[a-zA-Z0-9]+@qawolf.email$/;
  return emailRegex.test(source);
}
