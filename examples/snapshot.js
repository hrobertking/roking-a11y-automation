const {
  launch,
  snapshot,
} = require('../src/puppeteer');

let browser;

launch({
  height: 1080,
  url: 'https://hrobertking.github.io/thinking-about-web-accessibility/date.htm',
  width: 1920,
})
  .then(async (response) => {
    browser = response.browser;

    const { content, screenshot } = await snapshot(); // eslint-disable-line no-unused-vars

    /* eslint-disable no-console */
    console.log('=======================================');
    console.log('CONTENT');
    console.log('---------------------------------------');
    console.log(content);
    console.log('=======================================');
    /* eslint-enable no-console */
  })
  .then(() => browser.close())
  .catch((err) => console.log(`Caught:\n${err}`)); // eslint-disable-line no-console
