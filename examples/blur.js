const {
  analyze,
  blur,
  focus,
  launch,
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
  return page.screenshot({ path: 'examples/screenshot/blur-loaded.png' });
})
.then(async () => {
  await focus({
    target: '#toggle-button'
  });
  return page.screenshot({ path: 'examples/screenshot/blur-focused.png' });
})
.then(async () => {
  await blur({
    target: '#toggle-button'
  });
  return page.screenshot({ path: 'examples/screenshot/blur-blurred.png' });
})
.then(() => browser.close())
.catch(() => browser.close());
