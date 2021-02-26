const {
  click,
  launch,
} = require('../src/puppeteer');

let browser;
let page;

launch({
  height: 1080,
  url: 'https://hrobertking.github.io/thinking-about-web-accessibility/automated-test-example.htm',
  verbose: true,
  width: 1920,
})
  .then((response) => {
    browser = response.browser;
    page = response.page;

    return page.screenshot({ path: 'examples/screenshot/verbose.png' });
  })
  .then(async () => {
    await click({ target: '#toggle-button' });
    return page.screenshot({ path: 'examples/screenshot/verbose-toggle-on.png' });
  })
  .then(async () => {
    await click({ target: '#toggle-button' });
    return page.screenshot({ path: 'examples/screenshot/verbose-toggle-off.png' });
  })
  .then(() => browser.close())
  .catch(() => browser.close());
