const {
  click,
  launch,
} = require('../src/puppeteer');

let browser;
let page;

launch({
  height: 1080,
  throws: true,
  url: 'https://hrobertking.github.io/thinking-about-web-accessibility/date.htm',
  width: 1920,
})
  .then((response) => {
    browser = response.browser;
    page = response.page;

    return page.screenshot({ path: 'examples/screenshot/throws-loaded.png' });
  })
  .then(async () => {
    await click({ target: '#dobDay' });
    return page.screenshot({ path: 'examples/screenshot/throws-dobDay.png' });
  })
  .then(async () => {
    await click({ target: '#dobMonth' });
    return page.screenshot({ path: 'examples/screenshot/throws-dobMonth.png' });
  })
  .then(() => browser.close())
  .catch((error) => {
    console.log(`Caught error:\n${error}`); // eslint-disable-line no-console
    browser.close();
  });
