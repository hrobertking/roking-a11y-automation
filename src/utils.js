const CRLF = '\n';

/**
 * @name pad
 * @returns {String}
 * @param {Number} count
 */
const pad = (count) => {
  const n = Number(count);
  const s = Number.isNaN(n) || n === 0 ? '' : new Array(...new Array(n)).reduce((t) => `${t} `, '');

  return `${s}`;
};
exports.pad = pad;

/**
 * @name prettyPrintHtml
 * @returns {String}
 * @param {String} input
 */
/* eslint-disable complexity */
const prettyPrintHtml = (input = '') => {
  const pp = input
    .replace(/>\s*</g, '><')
    .replace(/</g, '~::~<')
    .replace(/\s*xmlns:/g, '~::~xmlns:')
    .replace(/\s*xmlns=/g, '~::~xmlns=')
    .split('~::~');
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
