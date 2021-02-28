const {
  click,
  launch,
  target,
} = require('../src/puppeteer');

let browser;

launch({
  height: 1080,
  summary: true,
  url: 'https://hrobertking.github.io/thinking-about-web-accessibility/automated-test-example.html',
  width: 1920,
})
  .then(async (response) => {
    browser = response.browser;

    await target({
      include: '#always-pass',
      exclude: [
        '#always-fail',
        '#test-block',
      ],
    });

    await click({ target: '#toggle-button' });
  })
  .then(() => browser.close())
  .catch((error) => console.log(error)); // eslint-disable-line no-console
