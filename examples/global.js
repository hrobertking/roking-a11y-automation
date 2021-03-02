const {
  analyze,
  blur,
  click,
  focus,
  hover,
  launch,
  select,
  sendKeys,
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
  return page.screenshot({ path: 'examples/screenshot/global-loaded.png' });
})
.then(async () => {
  await click({
    target: '#toggle-button',
    waitFor: {
      target: '#test-block',
      visible: true,
    }
  });
  return page.screenshot({ path: 'examples/screenshot/global-clicked.png' });
})
.then(async () => {
  await focus({
    target: '#name-tooltip',
    waitFor: {
      target: '#tid-tooltip',
      visible: true,
    }
  });
  return page.screenshot({ path: 'examples/screenshot/global-focus.png' });
})
.then(async () => {
  await blur({
    target: '#name-tooltip'
  });
  return page.screenshot({ path: 'examples/screenshot/global-blur.png' });
})
.then(async () => {
  await hover({
    target: '#name-tooltip',
    waitFor: {
      target: '#tid-tooltip',
      visible: true,
    }
  });
  return page.screenshot({ path: 'examples/screenshot/global-hover.png' });
})
.then(async () => {
  await select({
    target: '#phone-type',
    value: 'Mobile',
  });
  return page.screenshot({ path: 'examples/screenshot/global-select.png' });
})
.then(async () => {
  await sendKeys({
    target: '#phone',
    keys: '6025551212',
  });
  return page.screenshot({ path: 'examples/screenshot/global-sendkeys.png' });
})
.then(() => browser.close())
.catch(() => browser.close());
