/**
 * @see {https://github.com/puppeteer/puppeteer/blob/v5.2.1/docs/api.md|Puppeteer API Reference}
 */

const { AxePuppeteer } = require('@axe-core/puppeteer');
const DRIVER = require('puppeteer');
const FS = require('fs');

const {
  analyze,
  clipregion,
  harness,
  html,
  inrange,
  mkdir,
  prettyPrintHtml,
  table,
  target,
} = require('./utils');

let Harness = {
  axe: null,
  browser: null,
  console: true,
  quiet: false,
  page: null,
  summary: false,
  verbose: false,
  target: null,
  throws: false,
};

let Screenshot = {
  type: 'png',
  fullPage: true,
  omitBackground: false,
  encoding: 'binary',
};

/**
 * @name blur
 * @returns {Promise}
 * @param {Action} action
 */
const blur = async (action) => {
  const {
    target: selector,
    waitFor = {},
  } = action;
  const {
    target: waitSelector,
    ...waitOptions
  } = waitFor;

  return Harness.page.waitForSelector(selector)
    .then(() => Harness.page.$eval(selector, (evt) => evt.blur())
        .then(async () => {
          if (waitSelector) {
            await Harness.page.waitForSelector(waitSelector, waitOptions)
              .then(async () => {
                await analyze({ action: 'blur', target: selector });
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            await analyze({ action: 'blur', target: selector });
          }
        })
        .catch((error) => {
          console.log(`Could not blur on ${selector}:\n${error}`);
        })
    )
    .catch(() => {
      console.log(`Could not find ${selector}`);
    });
};

/**
 * @name click
 * @returns {Promise}
 * @param {Action} action
 */
const click = async (action) => {
  const {
    options,
    target: selector,
    waitFor = {},
  } = action;
  const {
    target: waitSelector,
    ...waitOptions
  } = waitFor;

  return Harness.page.waitForSelector(selector)
    .then(() => Harness.page.click(selector, options)
        .then(async () => {
          if (waitSelector) {
            await Harness.page.waitForSelector(waitSelector, waitOptions)
              .then(async () => {
                await analyze({ action: 'click', options, target: selector });
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            await analyze({ action: 'click', options, target: selector });
          }
        })
        .catch((error) => {
          console.log(`Could not click on ${selector}:\n${error}`);
        })
    )
    .catch(() => {
      console.log(`Could not find ${selector}`);
    });
};

/**
 * @name focus
 * @returns {Promise}
 * @param {Action} action
 */
const focus = async (action) => {
  const {
    target: selector,
    waitFor = {},
  } = action;
  const {
    target: waitSelector,
    ...waitOptions
  } = waitFor;

  return Harness.page.waitForSelector(selector)
    .then(() => Harness.page.focus(selector)
        .then(async () => {
          if (waitSelector) {
            await Harness.page.waitForSelector(waitSelector, waitOptions)
              .then(async () => {
                await analyze({ action: 'focus', target: selector });
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            await analyze({ action: 'focus', target: selector });
          }
        })
        .catch((error) => {
          console.log(`Could not focus on ${selector}:\n${error}`);
        })
    )
    .catch(() => {
      console.log(`Could not find ${selector}`);
    });
};

/**
 * @name hover
 * @returns {Promise}
 * @param {Action} action
 * @description Hover is inherently bad for accessibility and user experience;
 *  it is recommended this method not be used unless there are specific hover
 *  interactions that are not covered by other interactions, such as `focus`.
 */
const hover = async (action) => {
  const {
    target: selector,
    waitFor = {},
  } = action;
  const {
    target: waitSelector,
    ...waitOptions
  } = waitFor;

  return Harness.page.waitForSelector(selector)
    .then(() => Harness.page.hover(selector)
        .then(async () => {
          if (waitSelector) {
            await Harness.page.waitForSelector(waitSelector, waitOptions)
              .then(async () => {
                await analyze({ action: 'hover', target: selector });
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            await analyze({ action: 'hover', target: selector });
          }
        })
        .catch((error) => {
          console.log(`Could not hover on ${selector}:\n${error}`);
        })
    )
    .catch(() => {
      console.log(`Could not find ${selector}`);
    });
};

/**
 * @name launch
 * @returns {Harness}
 * @param {Object} config
 * @property {Boolean} config.console - Sets Harness#console. Defaults to true.
 * @property {Number} config.height - Sets the height of the viewport; requires width.
 * @property {String} config.metadata - Sets Harness#metadata.
 * @property {Boolean} config.quiet - Turns off detail in results.
 * @property {String} config.save - Sets Harness#save.
 * @property {Booelan} config.summary - Sets Harness#summary.
 * @property {Boolean} config.throws - Sets Harness#throws. Defaults to false.
 * @property {String} config.url - The URL to load
 * @property {Boolean} config.verbose - Sets Harness#verbose. Defaults to false.
 * @property {Number} config.width - Sets the width of the viewport; requires height.
 * @description Launches Puppeteer using the 'chrome' product, configures the aXe interactions,
 *  configures the viewport, and loads the provided url, before returning handles to the
 *  browser, page, and aXe interface
 */
const launch = async (config = {}) => {
  const {
    console: useConsole = true,
    height,
    metadata,
    quiet = false,
    save,
    summary = false,
    throws = false,
    url,
    verbose = false,
    width,
  } = config;

  try {
    // initialize the harness
    Harness = harness({
      console: useConsole,
      metadata,
      quiet,
      save,
      summary,
      throws,
      verbose,
    });

    const browser = await DRIVER.launch({ product: 'chrome' });
    const page = await browser.newPage();
    await page.setBypassCSP(true); // required for accessibility testing

    if (height && width) {
      await page.setViewport({ height, width });
    }

    const axe = await new AxePuppeteer(page);

    // set the drivers on the harness
    Harness = harness({ ...Harness, browser, page, axe });

    // make sure the results file is ready
    if (Harness.save) {
      if (FS.existsSync(Harness.save)) {
        FS.unlinkSync(Harness.save);
      }
      if (Harness.save) {
        mkdir(Harness.save);
      }
    }

    if (url) {
      await Harness.page.goto(url);
    }
  } catch (error) {
    /* eslint-disable no-console */
    console.log('!!! WARNING !!!');
    console.log(error);
    /* eslint-enable no-console */
  }
  return Harness;
};

/**
 * @name select
 * @returns {Promise}
 * @param {Action} action
 */
const select = async (action) => {
  const {
    target: selector,
    value,
    waitFor = {},
  } = action;
  const {
    target: waitSelector,
    ...waitOptions
  } = waitFor;

  return Harness.page.waitForSelector(selector)
    .then(() => Harness.page.select(selector, value)
        .then(async () => {
          if (waitSelector) {
            await Harness.page.waitForSelector(waitSelector, waitOptions)
              .then(async () => {
                await analyze({ action: 'select', value, target: selector });
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            await analyze({ action: 'select', value, target: selector });
          }
        })
        .catch((error) => {
          console.log(`Could not select ${value} in ${selector}:\n${error}`);
        })
    )
    .catch(() => {
      console.log(`Could not find ${selector}`);
    });
};

/**
 * @name sendKeys
 * @returns {Promise}
 * @param {Action} action
 */
const sendKeys = async (action) => {
  const {
    keys,
    options,
    target: selector,
    waitFor = {},
  } = action;
  const {
    target: waitSelector,
    ...waitOptions
  } = waitFor;

  return Harness.page.waitForSelector(selector)
    .then(() => Harness.page.type(selector, keys, options)
        .then(async () => {
          if (waitSelector) {
            await Harness.page.waitForSelector(waitSelector, waitOptions)
              .then(async () => {
                await analyze({ action: 'sendKeys', keys, options, target: selector });
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            await analyze({ action: 'sendKeys', keys, options, target: selector });
          }
        })
        .catch((error) => {
          console.log(`Could not type ${keys} in ${selector}:\n${error}`);
        })
    )
    .catch(() => {
      console.log(`Could not find ${selector}`);
    });
};

/**
 * @name setScreenshot
 * @returns {Screenshot}
 * @param {Screenshot} config
 * @description Sets the image configuration options used by the screenshot
 *  produced by `snapshot`.
 */
const setScreenshot = async (config = {}) => {
  const {
    clip: newClip,
    encoding: newEncoding = Screenshot.encoding,
    fullPage: newFullPage = Screenshot.fullPage,
    omitBackground: newOmitBackground = Screenshot.omitBackground,
    path = '',
    quality: newQuality,
    type: newType = Screenshot.type,
  } = config;

  const enumEncoding = ['binary', 'base64'];
  const enumType = ['png', 'jpeg'];

  const clip = clipregion(newClip);
  const encoding = enumEncoding[Math.max(enumEncoding.indexOf(newEncoding), 0)];
  const fullPage = typeof newFullPage === 'boolean' ? newFullPage : true;
  const omitBackground = typeof newOmitBackground === 'boolean' ? newOmitBackground : false;
  const quality = inrange(newQuality, [0, 100]);
  const type = enumType[Math.max(enumType.indexOf(newType), 0)];

  Screenshot = {
    path,
    type,
    quality,
    fullPage,
    clip,
    omitBackground,
    encoding,
  };

  return Screenshot;
};

/**
 * @name snapshot
 * @returns {Object} result
 * @property {String} result.content - The full HTML contents of the page.
 * @property {Binary|String} result.screenshot - The screenshot taken using the options specified
 *  in `setScreenshot`.
 * @param {String} filename - The path to use for the screenshot.
 */
const snapshot = async (filename = '') => {
  const { path = filename } = Screenshot;

  let content;
  let screenshot;

  mkdir(path);

  if (Harness.target) {
    const clip = await Harness.page.$eval(Harness.target, (node) => {
      const {
        bottom,
        top,
        right,
        left,
      } = node.getBoundingClientRect();

      return {
        height: bottom - top,
        width: right - left,
        x: left,
        y: top,
      };
    });
    [content, screenshot] = await Promise.all([
      Harness.page.$eval(
        Harness.target,
        (node) => node.outerHTML
      ),
      Harness.page.screenshot({
        ...Screenshot,
        fullPage: false,
        clip,
        path,
      }),
    ]);
  } else {
    [content, screenshot] = await Promise.all([
      Harness.page.content(),
      Harness.page.screenshot({ ...Screenshot, path }),
    ]);
  }
  content = prettyPrintHtml(content).replace(/\\{2}/g, '');

  return { content, screenshot };
};

module.exports = {
  analyze,
  blur,
  click,
  focus,
  hover,
  html,
  launch,
  select,
  sendKeys,
  setScreenshot,
  snapshot,
  target,
};
