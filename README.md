# roking-auto-a11y

The **roking-auto-a11y** module combines **puppeteer** and the aXe accessibility testing engine, **axe-core**, to test accessibility after page interactions. This addresses the hidden issue in accessibility testing where dynamic content behind interactions, such as accordions, dialog boxes, tooltips, and menus, is left unevaluated.

In order to use this, a test must be written that will perform the interactions on a page. An example of such a test is available in the _click_ test in the examples collection.

## Modules *required*

1. **@axe-core/puppeteer**
2. **@babel/polyfill**
3. **puppeteer**: installation might require the download host be specified, so you might need to set `PUPPETEER_DOWNLOAD_HOST` prior to installing _puppeteer_.
4. **pupeteer-core**

### Also recommended/required:
* testing harness, such as **jest**, **mocha**, or **chai** - used to write the tests that will use the analysis tools here
* a web server, such as **webpack** or **express** - used to provide the web page to be tested

## Examples

In order to run examples, the URLs to be tested, in each example, must point to a
running web server instance. Examples are using `http://localhost:4000` by default. 

1. **[click](examples/click.js)**: demonstrates how to target elements, call interactions, and output results. `node example/click.js`
2. **[console](examples/console.js)**: demonstrates how to report the analysis to avoid stopping tests. `node example/console.js`
3. **[html](examples/html.js)**: demonstrates how to get accessibility results as an HTML document. `node example/html.js`
3. **[save](examples/save.js)**: demonstrates how to save accessibility results to a file. `node example/save.js`
4. **[simple](examples/simple.js)**: demonstrates how to run a simple analysis. `node example/simple.js`
5. **[target](examples/target.js)**: demonstrates how to exclude elements from accessibility analysis. `node example/target.js`
6. **[throws](examples/throws.js)**: demonstrates how to integrate analysis with testing to fail tests by throwing an error. `node example/throws.js`
7. **[verbose](examples/verbose.js)**: demonstrates how to output verbose violations returned by axe.analyze. `node example/verbose.js`

### Output
There are three output modes, with multiple possible destinations. The _default_ mode provides the name of the test that has failed, e.g., "Elements must have sufficient color contrast", the impact of the rule, i.e., MINOR, MODERATE, SERIOUS, or CRITICAL, and the element or elements failing the test. The _quiet_ mode suppresses the list of elements violating the rule, and the _verbose_ mode provides all information available in the axe violations array.

All samples provided below include _metadata_ provided by the `summary` configuration.

#### Default (Sample)
```
{"action":{"action":"load","target":"https://hrobertking.github.io/thinking-about-web-accessibility/automated-test-example.html"},"inapplicable":0,"incomplete":0,"passes":38,"testEngine":{"name":"axe-core","version":"4.1.2"},"testEnvironment":{"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/88.0.4298.0 Safari/537.36","windowWidth":1920,"windowHeight":1080,"orientationAngle":0,"orientationType":"portrait-primary"},"timestamp":"2021-02-27T16:21:12.022Z","url":"https://hrobertking.github.io/thinking-about-web-accessibility/automated-test-example.html","violations":1}


Elements must have sufficient color contrast: SERIOUS

<p>This block is visible and will fail SC 1.4.3.</p>


=======================================



{"action":{"action":"click","target":"#toggle-button"},"inapplicable":0,"incomplete":0,"passes":42,"testEngine":{"name":"axe-core","version":"4.1.2"},"testEnvironment":{"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/88.0.4298.0 Safari/537.36","windowWidth":1920,"windowHeight":1080,"orientationAngle":0,"orientationType":"portrait-primary"},"timestamp":"2021-02-27T16:21:12.343Z","url":"https://hrobertking.github.io/thinking-about-web-accessibility/automated-test-example.html","violations":2}


Elements must have sufficient color contrast: SERIOUS

<p>This block is visible and will fail SC 1.4.3.</p>
<p>This block toggles between visible and invisible and should pass when invisible and fail when visible.
      </p>


=======================================

```

#### Quiet (Sample)
```
{"action":{"action":"load","target":"https://hrobertking.github.io/thinking-about-web-accessibility/automated-test-example.html"},"inapplicable":0,"incomplete":0,"passes":38,"testEngine":{"name":"axe-core","version":"4.1.2"},"testEnvironment":{"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/88.0.4298.0 Safari/537.36","windowWidth":1920,"windowHeight":1080,"orientationAngle":0,"orientationType":"portrait-primary"},"timestamp":"2021-02-27T16:17:28.687Z","url":"https://hrobertking.github.io/thinking-about-web-accessibility/automated-test-example.html","violations":1}

Elements must have sufficient color contrast: SERIOUS
```

#### Verbose (Sample)
```
{"action":{"action":"load","target":"https://hrobertking.github.io/thinking-about-web-accessibility/automated-test-example.html"},"inapplicable":0,"incomplete":0,"passes":38,"testEngine":{"name":"axe-core","version":"4.1.2"},"testEnvironment":{"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/88.0.4298.0 Safari/537.36","windowWidth":1920,"windowHeight":1080,"orientationAngle":0,"orientationType":"portrait-primary"},"timestamp":"2021-02-27T16:23:34.185Z","url":"https://hrobertking.github.io/thinking-about-web-accessibility/automated-test-example.html","violations":1}


[
  {
    "id": "color-contrast",
    "impact": "serious",
    "tags": [
      "cat.color",
      "wcag2aa",
      "wcag143"
    ],
    "description": "Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds",
    "help": "Elements must have sufficient color contrast",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.1/color-contrast?application=axe-puppeteer",
    "nodes": [
      {
        "any": [
          {
            "id": "color-contrast",
            "data": {
              "fgColor": "#cccccc",
              "bgColor": "#ffffff",
              "contrastRatio": 1.6,
              "fontSize": "12.0pt (16px)",
              "fontWeight": "normal",
              "expectedContrastRatio": "4.5:1"
            },
            "relatedNodes": [
              {
                "html": "<div class=\"fail-1-4-3\" id=\"always-fail\">\n        <p>This block is visible and will fail SC 1.4.3.</p>\n      </div>",
                "target": [
                  "#always-fail"
                ]
              }
            ],
            "impact": "serious",
            "message": "Element has insufficient color contrast of 1.6 (foreground color: #cccccc, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1"
          }
        ],
        "all": [],
        "none": [],
        "impact": "serious",
        "html": "<p>This block is visible and will fail SC 1.4.3.</p>",
        "target": [
          "#always-fail > p"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 1.6 (foreground color: #cccccc, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]


=======================================



{"action":{"action":"click","target":"#toggle-button"},"inapplicable":0,"incomplete":0,"passes":42,"testEngine":{"name":"axe-core","version":"4.1.2"},"testEnvironment":{"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/88.0.4298.0 Safari/537.36","windowWidth":1920,"windowHeight":1080,"orientationAngle":0,"orientationType":"portrait-primary"},"timestamp":"2021-02-27T16:23:34.462Z","url":"https://hrobertking.github.io/thinking-about-web-accessibility/automated-test-example.html","violations":2}


[
  {
    "id": "color-contrast",
    "impact": "serious",
    "tags": [
      "cat.color",
      "wcag2aa",
      "wcag143"
    ],
    "description": "Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds",
    "help": "Elements must have sufficient color contrast",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.1/color-contrast?application=axe-puppeteer",
    "nodes": [
      {
        "any": [
          {
            "id": "color-contrast",
            "data": {
              "fgColor": "#cccccc",
              "bgColor": "#ffffff",
              "contrastRatio": 1.6,
              "fontSize": "12.0pt (16px)",
              "fontWeight": "normal",
              "expectedContrastRatio": "4.5:1"
            },
            "relatedNodes": [
              {
                "html": "<div class=\"fail-1-4-3\" id=\"always-fail\">\n        <p>This block is visible and will fail SC 1.4.3.</p>\n      </div>",
                "target": [
                  "#always-fail"
                ]
              }
            ],
            "impact": "serious",
            "message": "Element has insufficient color contrast of 1.6 (foreground color: #cccccc, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1"
          }
        ],
        "all": [],
        "none": [],
        "impact": "serious",
        "html": "<p>This block is visible and will fail SC 1.4.3.</p>",
        "target": [
          "#always-fail > p"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 1.6 (foreground color: #cccccc, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1"
      },
      {
        "any": [
          {
            "id": "color-contrast",
            "data": {
              "fgColor": "#cccccc",
              "bgColor": "#ffffff",
              "contrastRatio": 1.6,
              "fontSize": "12.0pt (16px)",
              "fontWeight": "normal",
              "expectedContrastRatio": "4.5:1"
            },
            "relatedNodes": [
              {
                "html": "<div aria-hidden=\"false\" class=\"fail-1-4-3\" id=\"test-block\">\n        <p>This block toggles between visible and invisible and should pass when invisible and fail when visible.\n      </p></div>",
                "target": [
                  "#test-block"
                ]
              }
            ],
            "impact": "serious",
            "message": "Element has insufficient color contrast of 1.6 (foreground color: #cccccc, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1"
          }
        ],
        "all": [],
        "none": [],
        "impact": "serious",
        "html": "<p>This block toggles between visible and invisible and should pass when invisible and fail when visible.\n      </p>",
        "target": [
          "#test-block > p"
        ],
        "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 1.6 (foreground color: #cccccc, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1"
      }
    ]
  }
]


=======================================


```

## API Reference

All methods are built on top of Puppeteer and AxePupppeteer. You are encouraged to review the
documentation for these modules to determine how best to use the tools.  
* [AxePuppeteer API Reference](https://github.com/dequelabs/axe-puppeteer)  
* [Puppeteer API Reference](https://github.com/puppeteer/puppeteer/blob/v5.2.1/docs/api.md)  

### Data types used by the provided methods
The following data types are used throughout the provided methods.

#### _Action_ <a aria-hidden="true" name="action"><a>
* _String_ **action**: An action name, e.g., click, blur, or select
* _Object_ **options**: An object passed through to a puppeteer action
* _String[]_ **keys**: An object passed through to a puppeteer action
* _String_ **target**: The selector for the action target
* _String[]_ **value**: An object passed through to a pupeteer action
* _Object_ **waitFor**: A puppeteer wait object with a target.
* _Boolean_ **waitFor.hidden**: Waits until _target_ becomes hidden.
* _String_ **waitFor.target**: Selector for wait _target_.
* _Boolean_ **waitFor.visible**: Waits until _target_ becomes visible.

#### _ClipRegion_ <a aria-hidden="true" name="clip-region"></a>
* _Number_ **height**: The height of the region to target in a screenshot.
* _Number_ **width**: The width of the region to target in a screenshot.
* _Number_ **x**: The left coordinate of top-left corner of clip area.
* _Number_ **y**: The top coordinate of top-left corner of clip area.

#### _Harness_ <a aria-hidden="true" name="harness"></a>
* _AxePuppeteer_ **axe**: The _axe-puppeteer_ instance. See [AxePuppeteer API Reference](https://github.com/dequelabs/axe-puppeteer) for methods and properties available.
* _Puppeteer#Browser_ **browser**: The Puppeteer _Browser_ instance. See [Puppeteer API Reference](https://github.com/puppeteer/puppeteer/blob/v5.2.1/docs/api.md) for methods and properties available.
* _Boolean_ **console**: Sends accessibility results (see `verbose` for details) to the console. Default is true.
* _String_ **metadata**: Path used to save metadata information.
* _Puppeteer#Page_ **page**: The Puppeteer _Page_ instance. See [Puppeteer API Reference](https://github.com/puppeteer/puppeteer/blob/v5.2.1/docs/api.md) for methods and properties available.
* _Boolean_ **quiet**: Suppress detail in results.
* _String_ **save**: A destination path and filename for HTML document containing accessibility results. File is deleted each time `launch` is called.
* _Boolean_ **summary**: Send metadata to the console. Default is false.
* _String_ **target**: The CSS selector for the targeted element.
* _Boolean_ **throws**: Throw an Error using the accessibilty results (see `verbose` for details). Default is false.
* _Boolean_ **verbose**: Uses the `violations` object array from the [_AxeCore#Results_ object](https://www.deque.com/axe/core-documentation/api-documentation/#user-content-results-object) instead of the custom message for reporting when true. Default is false.

#### _Results_ <a aria-hidden="true" name="results"></a>
See [_AxeCore#Results_ object](https://www.deque.com/axe/core-documentation/api-documentation/#user-content-results-object)

#### _Screenshot_ <a aria-hidden="true" name="screenshot"></a>
* _ClipRegion_ **clip**: An object which specifies clipping region of the page. 
* _String_ **encoding**: One of 'base64' or 'binary'. Default is 'binary'.
* _Boolean_ **fullPage**: When true, takes a screenshot of the full scrollable page.
* _Boolean_ **omitBackground**: Hides default white background; allows transparent screenshots.
* _String_ **path**: The file path to save the image to.
* _Number_ **quality**: The quality of the image, between 0-100.
* _String_ **type**: One of 'jpeg' or 'png'.

### Public methods
All methods return a _Promise_, which is resolved to the specified type.

#### analyze
_[Results](#results)_ **analyze**(_Action_ action], [_Boolean_ override]): Runs AxePuppeteer#analyze and formats and outputs the response using the private functions according to the `Harness` settings (`console`, `metadata`, `save`, `summary`, `throws`, and `verbose`), unless the handlers are overriden by `override`, before returning the [_AxeCore#Results_ object](https://www.deque.com/axe/core-documentation/api-documentation/#user-content-results-object).

##### Example
```
analyze({ action: 'load', target: 'https://hrobertking.github.io/thinking-about-web-accessibility/' }, true).then(results => {
  const {
    inapplicable = [],
    incomplete = [],
    passes = [],
    violations = [],
  } = results;

  const testCount = inapplicable.length + incomplete.length + passes.length + violations.length;
  const percPassed = Math.max(passes.length / Math.max(testCount, 1), 1);

  if (violations.length) {
    throw Error('Accessibility violations');
  }
});
```

#### blur
_void_ **blur**(_Action_ action): Blurs the element identified by the `selector`.

##### Example
```
await blur({ target: 'input#email', waitFor: { target: 'email-validation', visible: true } });
```

#### click
_void_ **click**(_Action_ action): Clicks on the element identified by the `selector`,
optionally providing data through the `options` argument.

The _options_ argument may contain any of the following properties:
- _String_ **button**: One of 'left', 'middle', 'right'; defaults to 'left'.
- _Number_ **clickCount**: Defaults to 1.
- _Number_ **delay**: Milliseconds to wait between mousedown and mouseup; defaults to 0.

##### Example
```
await click({ target: 'button#continue', options: { clickCount: 2 } });
```

#### focus
_void_ **focus**(_Action_ action): Focuses the element identified by the `selector`.

##### Example
```
await focus({ target: 'input#email', waitFor: { target: 'email-status', hidden: true } });
```

#### hover
_void_ **hover**(_Action_ action): Hover is inherently bad for accessibility and user experience;
it is recommended this method not be used unless there are specific hover interactions that are not
covered by other interactions, such as `focus`.

##### Example
```
await hover({ target: 'input#email' });
```

#### html
_String_ **html**(): Returns the violations as an HTML document.

##### Example
```
await html();
```

#### launch
_[Harness](#harness)_ **launch**(_Object_ config): Launches Puppeteer using the `chrome` product,
configures the aXe interactions, configures the viewport, clears the Axe Puppeteer
results, and loads the provided url, before returning handles to the interaction _[Harness](#harness)_.

The configuration object can have any of the following properties:
- _Boolean_ **console**: Sets Harness#console.
- _Number_ **height**: Sets the height of the viewport; requires `width`.
- _String_ **metadata**: Path used to save test metadata in JSON format.
- _Booelan_ **quiet**: Suppress test detail.
- _String_ **save**: Sets Harness#save.
- _Boolean_ **summary**: Output metadata to the console.
- _Boolean_ **throws**: Sets Harness#throws.
- _String_ **url**: The URL to load.
- _Boolean_ **verbose**: Sets Harness#verbose.
- _Number_ **width**: Sets the width of the viewport; requires `height`.

##### Example
```
const {
  browser,
  page,
} = await launch({
  height: 480,
  metadata: '__tests__/results/summary/',
  save: '__tests__/results/a11y.txt',
  url: 'http://localhost:3000',
  width: 640
});

await page.reload();
```

#### select
_void_ **select**(_Action_ action): Selects the value(s) specified in the
element identified by the action `target`.

##### Example
```
await select({ target: 'select#country', value: 'US' });
```

#### sendKeys
_void_ **sendKeys**(_Action_ action): Sends the specified keystrokes
to the element identified by the `selector`. An `options` object containing a **delay** for milliseconds
to wait between keypresses may be passed (default is 0).

##### Example
```
await sendKeys({ target: 'input#email', keys: 'robert.king@aexp.com' });
```

#### setScreenshot
_[Screenshot](#screenshot)_ **setScreenshot**(_[Screenshot](#screenshot)_ config): Sets the image configuration options used by the
screenshot produced by `snapshot`.

##### Example
```
await setScreenshot({fullPage: true, path: 'screenshot.jpg', type: 'jpeg'});
```

#### snapshot
_Object_ **snapshot**([_String_ filename]): Generates the HTML and a screenshot of the targeted element,
and returns both in an object with a **content** property and a **screenshot** property. If a `filename`
is provided, or if a screenshot path has been set using **setScreenshot**, the screenshot will be saved to
the specified location. The `filename` is relative to the process directory.

##### Example
```
const {
  content,
  screenshot,
} = await snapshot('__tests__/results/screenshot.png');
expect(content).toMatchSnapshot();
```

#### target
_void_ **target**(_Object_ selectors): Sets the target of the accessibility testing run automatically
after each interaction. The _selectors_ object has two properties, _String_ **include** and _String[]_ **exclude**,
which include selectors for elements to target or exclude.

##### Example
```
await target({ include: 'page1', exclude: ['page2', 'page3'] });
```
