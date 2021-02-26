const {
  click,
  html,
  launch,
} = require('../src/puppeteer');

let browser;

launch({
  height: 1080,
  url: 'https://hrobertking.github.io/thinking-about-web-accessibility/date.htm',
  width: 1920,
})
  .then(async (response) => {
    browser = response.browser;

    await click({ target: '#dobDay' });
    console.log(await html()); // eslint-disable-line no-console
  })
  .then(() => browser.close())
  .catch((error) => console.log(error)); // eslint-disable-line no-console
