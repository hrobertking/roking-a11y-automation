const { launch } = require('../src/puppeteer');

let axeBuilder;
let browser;
let page;

launch()
  .then(async (response) => {
    axeBuilder = response.axe;
    browser = response.browser;
    page = response.page;

    await page.goto('https://hrobertking.github.io/thinking-about-web-accessibility/date.htm');
    return page.screenshot({ path: 'examples/screenshot/simple-load.png' });
  })
  .then(async () => {
    const results = await axeBuilder.analyze();
    console.log(results); // eslint-disable-line no-console
  })
  .then(() => browser.close());
