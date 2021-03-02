const FS = require('fs');

const PATH = require('path');
/**
 * @see {https://github.com/puppeteer/puppeteer/blob/v5.2.1/docs/api.md|Puppeteer API Reference}
 * @see {@link https://www.deque.com/axe/core-documentation/api-documentation/|AXE API Reference}

 * @typedef Action
 * @property {String} action - An action name, e.g., click, blur, select
 * @property {Object} options - An object passed through a puppeteer action
 * @property {String} options.button - One of 'left', 'middle', 'right'; defaults to 'left'.
 * @property {Number} options.clickCount - Defaults to 1.
 * @property {Number} options.delay - Milliseconds to wait in action; defaults to 0.
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


const CRLF = '\n';
const TYPE_HARNESS = {
  axe: null,
  browser: null,
  console: true,
  quiet: false,
  page: null,
  summary: false,
  verbose: false,
  target: null,
  throws: false
};
let HARNESS = { ...TYPE_HARNESS
};
let METADATA;
let VIOLATIONS;
/**
 * @private
 * @property css
 * @type {String}
 * @description CSS used for results markup
 */

const css = `
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
/**
 * @private
 * @method doc
 * @returns {String}
 * @description Returns HTML table markup for the VIOLATIONS array
 */

const doc = () => `
<table>
  <thead>
    <tr>
      <th scope="col">Rule</th>
      <th scope="col">Impact</th>
    </tr>
  </thead>
  <tbody>${(VIOLATIONS || []).map(rule => {
  const {
    any = [],
    all = []
  } = rule.nodes.pop() || {};
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
          <ul>${any.map(failure => `
            <li>
              ${failure.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
              ${failure.relatedNodes.length > 0 ? `
              <div>
                <em>Related Nodes</em>:
                <ul>${failure.relatedNodes.map(node => `
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
          <ul>${all.map(failure => `
            <li>
              ${failure.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
              ${failure.relatedNodes.length > 0 ? `
              <div>
                <em>Related Nodes</em>:
                <ul>${failure.relatedNodes.map(node => `
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
            ${icons[rule.impact]}
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
 * @method handle
 * @returns {undefined}
 * @param {String} message
 * @description Sends the results message to the console or throws it as an Error
 *   according to Harness.throw
 */


const handle = message => {
  const content = `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Evaluation Results</title>
<style type="text/css">
${css}
</style>
</head>
<body>
<h1>Evaluation Results</h1>
${doc()}
</body>
</html>
`;

  if (HARNESS.save) {
    mkdir(HARNESS.save);
    FS.writeFile(HARNESS.save, content, {
      encoding: 'utf8'
    }, noop);
  }

  if (HARNESS.console) {
    /* eslint-disable no-console */
    console.log(`\n${message}`);
    console.log('\n\n====================================\n\n');
    /* eslint-enable no-console */
  }

  if (HARNESS.throws) {
    throw new Error(message);
  }
};
/**
 * @private
 * @name pad
 * @returns {String}
 * @param {Number} count
 */


const pad = count => {
  const n = Number(count);
  const s = Number.isNaN(n) || n === 0 ? '' : new Array(...new Array(n)).reduce(t => `${t} `, '');
  return `${s}`;
};
/**
 * @private
 * @name sort
 * @returns {Object[]}
 * @param {Object[]} violations
 * @description Sorts the AxeResults#violations array by impact, moving higher priority
 *  violations to lower array indices.
 */


const sort = (violations = []) => {
  const IMPACT = ['minor', 'moderate', 'serious', 'critical'];

  const sortByImpact = (a, b) => IMPACT.indexOf(b.impact) - IMPACT.indexOf(a.impact);

  return violations.map(violation => {
    const {
      nodes,
      ...remainder
    } = violation;
    nodes.forEach(node => {
      node.all.sort(sortByImpact);
      node.any.sort(sortByImpact);
      node.none.sort(sortByImpact);
    });
    nodes.sort(sortByImpact);
    return { ...remainder,
      nodes
    };
  }).sort(sortByImpact);
};
/**
 * @private
 * @name tostring
 * @returns {String}
 */


const tostring = () => {
  if (HARNESS.verbose) {
    return JSON.stringify(VIOLATIONS, null, 2);
  }

  return VIOLATIONS.map(violation => {
    const {
      help,
      impact,
      nodes
    } = violation;
    const details = `\n\n${nodes.map(node => node.html).join('\n')}`;
    return `${help}: ${impact.toUpperCase()}${!HARNESS.quiet ? details : ''}`;
  }).join(!HARNESS.quiet ? '\n---------------------------------------\n\n' : '\n');
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

  if (HARNESS.axe) {
    try {
      results = await HARNESS.axe.analyze();
      const {
        inapplicable,
        incomplete,
        passes,
        testEngine,
        testEnvironment,
        timestamp,
        url,
        violations
      } = results;
      METADATA = {
        action,
        inapplicable: inapplicable.reduce((acc, val) => acc + val.nodes.length, 0),
        incomplete: incomplete.reduce((acc, val) => acc + val.nodes.length, 0),
        passes: passes.reduce((acc, val) => acc + val.nodes.length, 0),
        testEngine,
        testEnvironment,
        timestamp,
        url,
        violations: violations.reduce((acc, val) => acc + val.nodes.length, 0)
      }; // sort violations

      VIOLATIONS = sort(violations);

      if (HARNESS.metadata) {
        const out = `${HARNESS.metadata}${PATH.sep}${timestamp.replace(/\D/g, '')}.json`;
        mkdir(out);
        FS.writeFile(out, JSON.stringify(METADATA), {
          encoding: 'utf8'
        }, noop);
      }

      if (HARNESS.summary) {
        /* eslint-disable no-console */
        console.log(`\n${JSON.stringify(METADATA, 2)}\n`);
        /* eslint-enable no-console */
      }

      if (!override) {
        if (VIOLATIONS.length > 0) {
          handle(tostring());
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  return results;
};

exports.analyze = analyze;
/**
 * @name clipregion
 * @returns {ClipRegion}
 * @param {Object} region
 * @description Evaluates the provided region and returns a valid ClipRegion or undefined.
 */

const clipregion = (region = {}) => {
  const required = ['height', 'width', 'x', 'y']; // undefined values (missing required properties) are NaN

  const nan = required.map(key => Number.isNaN(Number(region[key]))).filter(v => v);
  return nan.length === 0 ? region : undefined;
};

exports.clipregion = clipregion;
/**
 * @method harness
 * returns {Harness}
 * @param {Harness} Harness
 * @description Initializes the HARNESS.
 */

const harness = Harness => {
  HARNESS = { ...TYPE_HARNESS,
    ...Harness
  };
  return HARNESS;
};

exports.harness = harness;
/**
 * @name html
 * @returns {String}
 * @description Returns the violations as an HTML document.
 */

const html = `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Evaluation Results</title>
<style type="text/css">
${css}
</style>
</head>
<body>
<h1>Evaluation Results</h1>
${doc()}
</body>
</html>
`;
exports.html = html;
/**
 * @property icons
 * @type {Enum}
 * @description UTF-8 character used to identify different severities
 */

const icons = {
  minor: '⚑',
  moderate: '☹',
  serious: '⚠',
  critical: '☠'
};
exports.icons = icons;
/**
 * @private
 * @name getInRange
 * @returns {Number}
 * @param {Number|String} num
 * @param {Number[]} range
 * @description Evaluates the value to ensure it's in the specified range.
 */

const inrange = (value, range = [0, 0]) => {
  const test = Number(value);
  return !Number.isNaN(test) ? Math.min(Math.max(test, range[0]), range[1]) : undefined;
};

exports.inrange = inrange;
/**
 * @name mkdir
 * @returns {undefined}
 * @param {String} path
 */

const mkdir = path => {
  if (path) {
    const dir = PATH.dirname(path);

    if (!FS.existsSync(dir)) {
      FS.mkdirSync(dir, {
        recursive: true
      });
    }
  }
};

exports.mkdir = mkdir;
/**
 * @name noop
 * @returns {undefined}
 */

const noop = () => undefined;

exports.noop = noop;
/**
 * @name prettyPrintHtml
 * @returns {String}
 * @param {String} input
 */

/* eslint-disable complexity */

const prettyPrintHtml = (input = '') => {
  const pp = input.replace(/>\s*</g, '><').replace(/</g, '~::~<').replace(/\s*xmlns:/g, '~::~xmlns:').replace(/\s*xmlns=/g, '~::~xmlns=').split('~::~');
  const ppLen = pp.length;
  const dataB = /<\?/;
  const dataE = /]>/;
  const elB = /^<[\w,.:-]+/;
  const elE = /^<\/[\w,.:-]+/;
  const elN = /\/>/;
  const tagS = /<\w/;
  const tagF = /<\//;
  const btagS = /^<\w/;
  const btagE = /^<\/\w/;
  const ns = /xmlns[:=]/;
  const cmt = /-->/;
  let indent = 0;
  let lines = '';
  let flag = !1;

  for (let c = 0; c < ppLen; c += 1) {
    const el = pp[c];
    const prv = c - 1;
    const endMatch = elE.exec(el);
    const endTag = endMatch ? endMatch[0].replace('/', '') : '';

    if (/<!/.test(el)) {
      lines += CRLF + pad(indent) + el;
      flag = cmt.test(el) || dataE.test(el) || /!DOCTYPE/.test(el) ? !1 : !0;
    } else if (cmt.test(el) || dataE.test(el)) {
      lines += el;
      flag = !1;
    } else if (btagS.test(pp[prv]) && btagE.test(el) && elB.test(pp[prv]) === endTag) {
      lines += el;
      indent -= 1;
    } else if (tagS.test(el) && !tagF.test(el) && !elN.test(el)) {
      indent += 1;
      lines += flag ? el : CRLF + pad(indent) + el;
    } else if (tagS.test(el) && tagF.test(el)) {
      lines += flag ? el : CRLF + pad(indent) + el;
    } else if (tagF.test(el)) {
      indent -= 1;
      lines += flag ? el : CRLF + pad(indent) + el;
    } else if (elN.test(el)) {
      lines += flag ? el : CRLF + pad(indent) + el;
    } else if (dataB.test(el) || ns.test(el)) {
      lines += CRLF + pad(indent) + el;
    } else {
      lines += el;
    }
  }

  return lines[0] === '\n' ? lines.slice(1) : lines;
};
/* eslint-enable complexity */


exports.prettyPrintHtml = prettyPrintHtml;
/**
 * @method table
 * @returns {String}
 * @description Returns HTML table markup for the VIOLATIONS array
 */

exports.table = doc;
/**
 * @name target
 * @returns {Harness}
 * @param {Object} selectors
 * @property {String} selectors.include - CSS selector for the single element to evaluate.
 * @property {String[]} selectors.exclude - CSS selectors to ignore during accessibility evaluation.
 */

const target = async ({
  include,
  exclude
} = {}) => {
  try {
    HARNESS.target = include;
    HARNESS.axe.exclude(exclude.map(selector => [selector]));
    HARNESS.axe.include(HARNESS.target);
  } catch (error) {
    throw new Error('Unable to set target in axe.');
  }

  return HARNESS;
};

exports.target = target;