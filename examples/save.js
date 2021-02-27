const {
  click,
  launch,
} = require('../src/puppeteer');

let browser;
let page;

launch({
  console: false,
  height: 1080,
  save: 'examples/results/a11y-results.html',
  throws: false,
  url: 'https://hrobertking.github.io/thinking-about-web-accessibility/automated-test-example.html',
  verbose: true,
  width: 1920,
})
  .then((response) => {
    ({ browser, page } = response);

    return page.screenshot({ path: 'examples/screenshot/save-load.png' });
  })
  .then(async () => {
    await click({ target: '#toggle-button' })
      .then(() => page.screenshot({ path: 'examples/screenshot/save-dobDay.png' }));

    await click({ target: '#toggle-button' })
      .then(() => page.screenshot({ path: 'examples/screenshot/save-dobMonth.png' }));
  })
  .then(() => browser.close())
  .catch((err) => console.log(`caught ${err}`)); // eslint-disable-line no-console
