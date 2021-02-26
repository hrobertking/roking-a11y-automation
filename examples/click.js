const {
  analyze,
  blur,
  click,
  launch,
  sendKeys,
  snapshot,
  target,
} = require('../src/puppeteer');

let browser;
let page;

const starting = 'https://hrobertking.github.io/thinking-about-web-accessibility/automated-test-example.html';

launch({
  height: 1080,
  quiet: true,
  summary: true,
  url: starting,
  width: 1920,
})
.then((response) => {
  ({ browser, page } = response);

  analyze({ action: 'load', target: starting });
  return page.screenshot({ path: 'examples/screenshot/click-loaded.png' });
})
.then(async () => {
  await click({
    target: '#toggle-button',
    waitFor: {
      target: '#test-block',
      visible: true,
    }
  });
  return page.screenshot({ path: 'examples/screenshot/click-clicked.png' });
})
.then(() => browser.close())
.catch(() => browser.close());
