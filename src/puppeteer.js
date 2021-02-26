const { AxePuppeteer } = require('@axe-core/puppeteer');
const FS = require('fs');
const PATH = require('path');
const puppeteer = require('puppeteer');
const { prettyPrintHtml } = require('./utils');

/**
 * @see {https://github.com/puppeteer/puppeteer/blob/v5.2.1/docs/api.md|Puppeteer API Reference}
 * @see {@link https://www.deque.com/axe/core-documentation/api-documentation/|AXE API Reference}

 * @typedef Action
 * @property {String} action - An action name, e.g., click, blur, select
 * @property {Object} options - An object passed through a puppeteer action
 * @property {String} options.button - One of 'left', 'middle', 'right'; defaults to 'left'.
 * @property {Number} options.clickCount - Defaults to 1.
 * @property {Number} options.delay - Milliseconds to wait between mousedown and mouseup or keypresses; defaults to 0.
 * @property {String[]} keys - An object passed through a puppeteer action
 * @property {String} target - The selector of the action target
 * @property {String|String[]} value - An object passed through a puppeteer action
 * @property {Object} waitFor - A selector to wait for after an action has taken place.
 * @property {Boolean} waitFor.hidden - Wait until node is hidden
 * @property {String} waitFor.target: - Selector identifying wait target
 * @property {Boolean} waitFor.visible - Wait until node becomes visible
 *
 * @typedef ClipRegion
 * @property {Number} ClipRegion.height
 * @property {Number} ClipRegion.width
 * @property {Number} ClipRegion.x - Coordinate of top-left corner of clip area.
 * @property {Number} ClipRegion.y - Coordinate of top-left corner of clip area.
 *
 * @typedef Harness
 * @property {AxePuppeteer} Harness.axe
 * @property {Puppeteer#Browser} Harness.browser
 * @property {Boolean} Harness.console - Send violations to the console. Default is true.
 * @property {String} Harness.metadata - Path used to save metadata information
 * @property {Puppeteer#Page} Harness.page
 * @property {Boolean} Harness.quiet - Turns off detail in results.
 * @property {String} Harness.save - A destination path and filename for the axe results.
 * @property {Boolean} Harness.summary - Send metadata to the console. Default is false.
 * @property {String} Harness.target - The CSS selector for the targeted element.
 * @property {Boolean} Harness.throws - Throw an Error on violations. Default is false.
 * @property {Boolean} Harness.verbose - Use AxePuppeteer#Violations object. Default is false.
 *
 * @typedef Screenshot
 * @property {ClipRegion} Screenshot.clip - An object which specifies clipping region of the page.
 * @property {String} Screenshot.encoding - One of 'base64' or 'binary'. Default is 'binary'.
 * @property {Boolean} Screenshot.fullPage - Screenshot the full scrollable page.
 * @property {Boolean} Screenshot.omitBackground - Hides white background to allow transparent pics.
 * @property {String} Screenshot.path - The file path to save the image to.
 * @property {Number} Screenshot.quality - The quality of the image, between 0-100.
 * @property {String} Screenshot.type - One of 'jpeg' or 'png'.
 */

const Harness = {
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

let MetaData = {};
let Violations = [];

/**
 * @private
 * @name gblMkDir
 * @returns {undefined}
 * @param {String} path
 */
const gblMkDir = (path) => {
  const dir = PATH.dirname(path);

  if (!FS.existsSync(dir)) {
    FS.mkdirSync(dir, { recursive: true });
  }
};
/**
 * @private
 * @name gblNoOp
 * @returns {undefined}
 */
const gblNoOp = () => undefined;

/**
 * @private
 * @name axeDocCss, axeDocIcons, axeDocTable
 * @returns {String}
 */
const axeDocCss = `
table {
  border-collapse: collapse;
  width: 100%;
}
tbody tr:nth-of-type(odd) {
  background-color: #efefef;
}
tbody td:nth-of-type(n+2) {
  text-align: center;
}
tbody td.impact {
  text-align: left;
  white-space: nowrap;
}
td, th {
  padding: 0.25em;
  vertical-align: top;
}
th:first-of-type {
  text-align: left;
}
.flex {
  align-items: center;
  display: inline-flex;
}
.icon {
  cursor: default;
  display: inline-block;
  font-size: 1.5em;
  margin-right: 0.25em;
  text-align: center;
  user-select: none;
  width: 1em;
}`;
const axeDocIcons = {
  minor: '⚑',
  moderate: '☹',
  serious: '⚠',
  critical: '☠',
};
const axeDocTable = () => `
<table>
  <thead>
    <tr>
      <th scope="col">Rule</th>
      <th scope="col">Impact</th>
    </tr>
  </thead>
  <tbody>${Violations.map((rule) => {
    const { any = [], all = [] } = rule.nodes.pop() || {};

    return `
    <tr>
      <td>
        <a target="_blank" href="${rule.helpUrl}">
          ${rule.help.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </a>

        <div>${any && any.length > 0 ? `
          <p>
            <em>Fix any of the following</em>
          </p>
          <ul>${any.map((failure) => `
            <li>
              ${failure.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
              ${failure.relatedNodes.length > 0 ? `
              <div>
                <em>Related Nodes</em>:
                <ul>${failure.relatedNodes.map((node) => `
                  <li>
                    ${node.target.join(' ').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                  </li>`).join('')}
                </ul>
              </div>` : ''}
            </li>`).join('')}
          </ul>` : ''}
          ${all && all.length > 0 ? `
          <p>
            <em>Fix all of the following</em>
          </p>
          <ul>${all.map((failure) => `
            <li>
              ${failure.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
              ${failure.relatedNodes.length > 0 ? `
              <div>
                <em>Related Nodes</em>:
                <ul>${failure.relatedNodes.map((node) => `
                  <li>
                    ${node.target.join(' ').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                  </li>`).join('')}
                </ul>
              </div>` : ''}
            </li>`).join('')}
          </ul>` : ''}
        </div>
      </td>
      <td class="impact">
        <span class="flex">
          <span aria-hidden="true" class="icon">
            ${axeDocIcons[rule.impact]}
          </span>
          <span>${rule.impact}</span>
        </span>
      </td>
    </tr>`;
  }).join('')}
  </tbody>
</table>`;

/**
 * @private
 * @name axeHandle
 * @returns {undefined}
 * @param {String} message
 * @description Sends the results message to the console, or throws it as an Error
 *  according to Harness.throw
 */
const axeHandle = (message) => {
  if (Harness.save) {
    const doc = `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Evaluation Results</title>
<style type="text/css">
${axeDocCss}
</style>
</head>
<body>
${axeDocTable(Violations)}
</body>
</html>
`;

    gblMkDir(Harness.save);

    FS.writeFile(
      Harness.save,
      doc,
      { encoding: 'utf8' },
      gblNoOp
    );
  }
  if (Harness.console) {
    /* eslint-disable no-console */
    console.log(`\n${message}`);
    console.log('\n\n=======================================\n\n');
    /* eslint-enable no-console */
  }
  if (Harness.throw) {
    throw new Error(message);
  }
};
/**
 * @private
 * @name axeHead
 * @returns {String}
 */
const axeHead = () => {
  if (Harness.verbose) {
    return JSON.stringify(Violations, null, 2);
  }

  return Violations.map((violation) => {
    const {
      help,
      impact,
      nodes,
    } = violation;
    const details = `\n\n${nodes.map((node) => node.html).join('\n')}`;

    return `${help}: ${impact.toUpperCase()}${!Harness.quiet ? details : ''}`;
  }).join(!Harness.quiet ? '\n---------------------------------------\n\n' : '\n');
};
/**
 * @private
 * @name axeSortByImpact
 * @returns {Object[]}
 * @param {Object[]} violations
 * @description Sorts the AxeResults#violations array by impact, moving higher priority
 *  violations to lower array indices.
 */
const axeSortByImpact = (violations = []) => {
  const IMPACT = ['minor', 'moderate', 'serious', 'critical'];
  const sortByImpact = (a, b) => IMPACT.indexOf(b.impact) - IMPACT.indexOf(a.impact);
  return violations.map((violation) => {
    const { nodes, ...remainder } = violation;
    nodes.forEach((node) => {
      node.all.sort(sortByImpact);
      node.any.sort(sortByImpact);
      node.none.sort(sortByImpact);
    });
    nodes.sort(sortByImpact);

    return {
      ...remainder,
      nodes,
    };
  }).sort(sortByImpact);
};
/**
 * @private
 * @name clipRegion
 * @returns {ClipRegion}
 * @param {Object} region
 * @description Evaluates the provided region and returns a valid ClipRegion or undefined.
 */
const clipRegion = (region = {}) => {
  const required = ['height', 'width', 'x', 'y'];

  // undefined values (missing required properties) are NaN
  const nan = required.map((key) => Number.isNaN(Number(region[key]))).filter((v) => v);

  return nan.length === 0 ? region : undefined;
};
/**
 * @private
 * @name getInRange
 * @returns {Number}
 * @param {Number|String} num
 * @param {Number[]} range
 * @description Evaluates the value to ensure it's in the specified range.
 */
const getInRange = (value, range = [0, 0]) => {
  const test = Number(value);

  return !Number.isNaN(test) ? Math.min(Math.max(test, range[0]), range[1]) : undefined;
};

/**
 * @name analyze
 * @returns {Promise}
 * @param {Action} [action]
 * @param {Boolean} [override]
 * @description Runs AxePuppeteer#analyze and formats the response using the private functions,
 *  unless the handlers are overriden.
 */
const analyze = async (action, override) => {
  let results;

  if (Harness.axe) {
    try {
      results = await Harness.axe.analyze();

      const {
        inapplicable,
        incomplete,
        passes,
        testEngine,
        testEnvironment,
        timestamp,
        url,
        violations,
      } = results;

      MetaData = {
        action,
        inapplicable: inapplicable.reduce((acc, val) => acc + val.nodes.length, 0),
        incomplete: incomplete.reduce((acc, val) => acc + val.nodes.length, 0),
        passes: passes.reduce((acc, val) => acc + val.nodes.length, 0),
        testEngine,
        timestamp,
        url,
        violations: violations.reduce((acc, val) => acc + val.nodes.length, 0),
      };

      // sort violations
      Violations = axeSortByImpact(violations);

      if (Harness.metadata) {
        const out = `${Harness.metadata}${PATH.sep}${timestamp.replace(/\D/g, '')}.json`;

        gblMkDir(out);

        FS.writeFile(
          out,
          JSON.stringify(MetaData),
          { encoding: 'utf8' },
          gblNoOp
        );
      }
      if (Harness.summary) {
        /* eslint-disable no-console */
        console.log(`\n${JSON.stringify(MetaData, 2)}\n`);
        /* eslint-enable no-console */
      }

      if (!override) {
        if (Violations.length > 0) {
          axeHandle(axeHead());
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  return results;
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
    .then(() => {
      return Harness.page.$eval(selector, (evt) => evt.blur())
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
        });
    })
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
    .then(() => {
      return Harness.page.click(selector, options)
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
        });
    })
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
    .then(() => {
      return Harness.page.focus(selector)
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
        });
    })
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
    .then(() => {
      return Harness.page.hover(selector)
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
        });
    })
    .catch(() => {
      console.log(`Could not find ${selector}`);
    });
};

/**
 * @name html
 * @returns {String}
 * @description Returns the violations as an HTML document
 */
const html = async () => `
<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Evaluation Results</title>
</head>
<body>
${axeDocTable(Violations)}
</body>
</html>
`;

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
    Harness.console = useConsole;
    Harness.metadata = metadata;
    Harness.quiet = quiet;
    Harness.save = save;
    Harness.summary = summary;
    Harness.throws = throws;
    Harness.verbose = verbose;

    if (FS.existsSync(Harness.save)) {
      FS.unlinkSync(Harness.save);
    }

    Harness.browser = await puppeteer.launch({ product: 'chrome' });
    Harness.page = await Harness.browser.newPage();
    await Harness.page.setBypassCSP(true); // required for accessibility testing

    if (height && width) {
      await Harness.page.setViewport({ height, width });
    }

    Harness.axe = await new AxePuppeteer(Harness.page);

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
    .then(() => {
      return Harness.page.select(selector, value)
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
        });
    })
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
    .then(() => {
      return Harness.page.type(selector, keys, options)
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
        });
    })
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

  const clip = clipRegion(newClip);
  const encoding = enumEncoding[Math.max(enumEncoding.indexOf(newEncoding), 0)];
  const fullPage = typeof newFullPage === 'boolean' ? newFullPage : true;
  const omitBackground = typeof newOmitBackground === 'boolean' ? newOmitBackground : false;
  const quality = getInRange(newQuality, [0, 100]);
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

  gblMkDir(path);

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

/**
 * @name target
 * @returns {undefined}
 * @param {Object} selectors
 * @property {String} include - CSS selector for the single element to evaluate.
 * @property {String[]} exclude - CSS selectors to ignore during accessibility evaluation.
 */
const target = async ({ include, exclude } = {}) => {
  try {
    Harness.target = include;

    Harness.axe.exclude(exclude.map((css) => [css]));
    Harness.axe.include(Harness.target);
  } catch (error) {
    throw new Error('Unable to set target in axe.');
  }
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
