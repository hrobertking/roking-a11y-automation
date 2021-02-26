const {
  click,
  launch,
} = require('../src');

let browser;
let page;

launch({
  height: 1080,
  url: 'https://hrobertking.github.io/thinking-about-web-accessibility/date.htm',
  width: 1920,
})
  .then((response) => {
    ({ browser, page } = response);

    return page.screenshot({ path: 'examples/screenshot/console-load.png' });
  })
  .then(async () => {
    await click({ target: '#dobDay' })
      .then(() => page.screenshot({ path: 'examples/screenshot/console-dobDay.png' }));

    await click({ target: '#dobMonth' })
      .then(() => page.screenshot({ path: 'examples/screenshot/console-dobMonth.png' }));
  })
  .then(() => browser.close())
  .catch((err) => console.log(`caught ${err}`)); // eslint-disable-line no-console
