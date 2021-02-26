const {
  click,
  launch,
  target,
} = require('../src/puppeteer');

let browser;

launch({
  height: 1080,
  url: 'https://hrobertking.github.io/thinking-about-web-accessibility/table.htm',
  width: 1920,
})
  .then(async (response) => {
    browser = response.browser;

    await target({
      include: '#simple-table',
      exclude: [
        '#form-elements',
        '#complex-groups',
        '#multi-level-headers',
      ],
    });

    await click({ target: '#airport-code-col' });
  })
  .then(() => browser.close())
  .catch((error) => console.log(error)); // eslint-disable-line no-console
