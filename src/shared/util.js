/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import "./compatibility.js";

const IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];
const FONT_IDENTITY_MATRIX = [0.001, 0, 0, 0.001, 0, 0];

/**
 * Refer to the `WorkerTransport.getRenderingIntent`-method in the API, to see
 * how these flags are being used:
 *  - ANY, DISPLAY, and PRINT are the normal rendering intents, note the
 *    `PDFPageProxy.{render, getOperatorList, getAnnotations}`-methods.
 *  - ANNOTATIONS_FORMS, ANNOTATIONS_STORAGE, ANNOTATIONS_DISABLE control which
 *    annotations are rendered onto the canvas (i.e. by being included in the
 *    operatorList), note the `PDFPageProxy.{render, getOperatorList}`-methods
 *    and their `annotationMode`-option.
 *  - OPLIST is used with the `PDFPageProxy.getOperatorList`-method, note the
 *    `OperatorList`-constructor (on the worker-thread).
 */
const RenderingIntentFlag = {
  ANY: 0x01,
  DISPLAY: 0x02,
  PRINT: 0x04,
  ANNOTATIONS_FORMS: 0x10,
  ANNOTATIONS_STORAGE: 0x20,
  ANNOTATIONS_DISABLE: 0x40,
  OPLIST: 0x100,
};

const AnnotationMode = {
  DISABLE: 0,
  ENABLE: 1,
  ENABLE_FORMS: 2,
  ENABLE_STORAGE: 3,
};

// Permission flags from Table 22, Section 7.6.3.2 of the PDF specification.
const PermissionFlag = {
  PRINT: 0x04,
  MODIFY_CONTENTS: 0x08,
  COPY: 0x10,
  MODIFY_ANNOTATIONS: 0x20,
  FILL_INTERACTIVE_FORMS: 0x100,
  COPY_FOR_ACCESSIBILITY: 0x200,
  ASSEMBLE: 0x400,
  PRINT_HIGH_QUALITY: 0x800,
};

const TextRenderingMode = {
  FILL: 0,
  STROKE: 1,
  FILL_STROKE: 2,
  INVISIBLE: 3,
  FILL_ADD_TO_PATH: 4,
  STROKE_ADD_TO_PATH: 5,
  FILL_STROKE_ADD_TO_PATH: 6,
  ADD_TO_PATH: 7,
  FILL_STROKE_MASK: 3,
  ADD_TO_PATH_FLAG: 4,
};

const ImageKind = {
  GRAYSCALE_1BPP: 1,
  RGB_24BPP: 2,
  RGBA_32BPP: 3,
};

const AnnotationType = {
  TEXT: 1,
  LINK: 2,
  FREETEXT: 3,
  LINE: 4,
  SQUARE: 5,
  CIRCLE: 6,
  POLYGON: 7,
  POLYLINE: 8,
  HIGHLIGHT: 9,
  UNDERLINE: 10,
  SQUIGGLY: 11,
  STRIKEOUT: 12,
  STAMP: 13,
  CARET: 14,
  INK: 15,
  POPUP: 16,
  FILEATTACHMENT: 17,
  SOUND: 18,
  MOVIE: 19,
  WIDGET: 20,
  SCREEN: 21,
  PRINTERMARK: 22,
  TRAPNET: 23,
  WATERMARK: 24,
  THREED: 25,
  REDACT: 26,
};

const AnnotationStateModelType = {
  MARKED: "Marked",
  REVIEW: "Review",
};

const AnnotationMarkedState = {
  MARKED: "Marked",
  UNMARKED: "Unmarked",
};

const AnnotationReviewState = {
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  NONE: "None",
};

const AnnotationReplyType = {
  GROUP: "Group",
  REPLY: "R",
};

const AnnotationFlag = {
  INVISIBLE: 0x01,
  HIDDEN: 0x02,
  PRINT: 0x04,
  NOZOOM: 0x08,
  NOROTATE: 0x10,
  NOVIEW: 0x20,
  READONLY: 0x40,
  LOCKED: 0x80,
  TOGGLENOVIEW: 0x100,
  LOCKEDCONTENTS: 0x200,
};

const AnnotationFieldFlag = {
  READONLY: 0x0000001,
  REQUIRED: 0x0000002,
  NOEXPORT: 0x0000004,
  MULTILINE: 0x0001000,
  PASSWORD: 0x0002000,
  NOTOGGLETOOFF: 0x0004000,
  RADIO: 0x0008000,
  PUSHBUTTON: 0x0010000,
  COMBO: 0x0020000,
  EDIT: 0x0040000,
  SORT: 0x0080000,
  FILESELECT: 0x0100000,
  MULTISELECT: 0x0200000,
  DONOTSPELLCHECK: 0x0400000,
  DONOTSCROLL: 0x0800000,
  COMB: 0x1000000,
  RICHTEXT: 0x2000000,
  RADIOSINUNISON: 0x2000000,
  COMMITONSELCHANGE: 0x4000000,
};

const AnnotationBorderStyleType = {
  SOLID: 1,
  DASHED: 2,
  BEVELED: 3,
  INSET: 4,
  UNDERLINE: 5,
};

const AnnotationActionEventType = {
  E: "Mouse Enter",
  X: "Mouse Exit",
  D: "Mouse Down",
  U: "Mouse Up",
  Fo: "Focus",
  Bl: "Blur",
  PO: "PageOpen",
  PC: "PageClose",
  PV: "PageVisible",
  PI: "PageInvisible",
  K: "Keystroke",
  F: "Format",
  V: "Validate",
  C: "Calculate",
};

const DocumentActionEventType = {
  WC: "WillClose",
  WS: "WillSave",
  DS: "DidSave",
  WP: "WillPrint",
  DP: "DidPrint",
};

const PageActionEventType = {
  O: "PageOpen",
  C: "PageClose",
};

const StreamType = {
  UNKNOWN: "UNKNOWN",
  FLATE: "FLATE",
  LZW: "LZW",
  DCT: "DCT",
  JPX: "JPX",
  JBIG: "JBIG",
  A85: "A85",
  AHX: "AHX",
  CCF: "CCF",
  RLX: "RLX", // PDF short name is 'RL', but telemetry requires three chars.
};

const FontType = {
  UNKNOWN: "UNKNOWN",
  TYPE1: "TYPE1",
  TYPE1STANDARD: "TYPE1STANDARD",
  TYPE1C: "TYPE1C",
  CIDFONTTYPE0: "CIDFONTTYPE0",
  CIDFONTTYPE0C: "CIDFONTTYPE0C",
  TRUETYPE: "TRUETYPE",
  CIDFONTTYPE2: "CIDFONTTYPE2",
  TYPE3: "TYPE3",
  OPENTYPE: "OPENTYPE",
  TYPE0: "TYPE0",
  MMTYPE1: "MMTYPE1",
};

const VerbosityLevel = {
  ERRORS: 0,
  WARNINGS: 1,
  INFOS: 5,
};

const CMapCompressionType = {
  NONE: 0,
  BINARY: 1,
  STREAM: 2,
};

// All the possible operations for an operator list.
const OPS = {
  // Intentionally start from 1 so it is easy to spot bad operators that will be
  // 0's.
  dependency: 1,
  setLineWidth: 2,
  setLineCap: 3,
  setLineJoin: 4,
  setMiterLimit: 5,
  setDash: 6,
  setRenderingIntent: 7,
  setFlatness: 8,
  setGState: 9,
  save: 10,
  restore: 11,
  transform: 12,
  moveTo: 13,
  lineTo: 14,
  curveTo: 15,
  curveTo2: 16,
  curveTo3: 17,
  closePath: 18,
  rectangle: 19,
  stroke: 20,
  closeStroke: 21,
  fill: 22,
  eoFill: 23,
  fillStroke: 24,
  eoFillStroke: 25,
  closeFillStroke: 26,
  closeEOFillStroke: 27,
  endPath: 28,
  clip: 29,
  eoClip: 30,
  beginText: 31,
  endText: 32,
  setCharSpacing: 33,
  setWordSpacing: 34,
  setHScale: 35,
  setLeading: 36,
  setFont: 37,
  setTextRenderingMode: 38,
  setTextRise: 39,
  moveText: 40,
  setLeadingMoveText: 41,
  setTextMatrix: 42,
  nextLine: 43,
  showText: 44,
  showSpacedText: 45,
  nextLineShowText: 46,
  nextLineSetSpacingShowText: 47,
  setCharWidth: 48,
  setCharWidthAndBounds: 49,
  setStrokeColorSpace: 50,
  setFillColorSpace: 51,
  setStrokeColor: 52,
  setStrokeColorN: 53,
  setFillColor: 54,
  setFillColorN: 55,
  setStrokeGray: 56,
  setFillGray: 57,
  setStrokeRGBColor: 58,
  setFillRGBColor: 59,
  setStrokeCMYKColor: 60,
  setFillCMYKColor: 61,
  shadingFill: 62,
  beginInlineImage: 63,
  beginImageData: 64,
  endInlineImage: 65,
  paintXObject: 66,
  markPoint: 67,
  markPointProps: 68,
  beginMarkedContent: 69,
  beginMarkedContentProps: 70,
  endMarkedContent: 71,
  beginCompat: 72,
  endCompat: 73,
  paintFormXObjectBegin: 74,
  paintFormXObjectEnd: 75,
  beginGroup: 76,
  endGroup: 77,
  beginAnnotations: 78,
  endAnnotations: 79,
  beginAnnotation: 80,
  endAnnotation: 81,
  /** @deprecated unused */
  paintJpegXObject: 82,
  paintImageMaskXObject: 83,
  paintImageMaskXObjectGroup: 84,
  paintImageXObject: 85,
  paintInlineImageXObject: 86,
  paintInlineImageXObjectGroup: 87,
  paintImageXObjectRepeat: 88,
  paintImageMaskXObjectRepeat: 89,
  paintSolidColorImageMask: 90,
  constructPath: 91,
};

const UNSUPPORTED_FEATURES = {
  /** @deprecated unused */
  unknown: "unknown",
  forms: "forms",
  javaScript: "javaScript",
  signatures: "signatures",
  smask: "smask",
  shadingPattern: "shadingPattern",
  /** @deprecated unused */
  font: "font",
  errorTilingPattern: "errorTilingPattern",
  errorExtGState: "errorExtGState",
  errorXObject: "errorXObject",
  errorFontLoadType3: "errorFontLoadType3",
  errorFontState: "errorFontState",
  errorFontMissing: "errorFontMissing",
  errorFontTranslate: "errorFontTranslate",
  errorColorSpace: "errorColorSpace",
  errorOperatorList: "errorOperatorList",
  errorFontToUnicode: "errorFontToUnicode",
  errorFontLoadNative: "errorFontLoadNative",
  errorFontBuildPath: "errorFontBuildPath",
  errorFontGetPath: "errorFontGetPath",
  errorMarkedContent: "errorMarkedContent",
  errorContentSubStream: "errorContentSubStream",
};

const PasswordResponses = {
  NEED_PASSWORD: 1,
  INCORRECT_PASSWORD: 2,
};

let verbosity = VerbosityLevel.WARNINGS;

function setVerbosityLevel(level) {
  if (Number.isInteger(level)) {
    verbosity = level;
  }
}

function getVerbosityLevel() {
  return verbosity;
}

// A notice for devs. These are good for things that are helpful to devs, such
// as warning that Workers were disabled, which is important to devs but not
// end users.
function info(msg) {
  if (verbosity >= VerbosityLevel.INFOS) {
    console.log(`Info: ${msg}`);
  }
}

// Non-fatal warnings.
function warn(msg) {
  if (verbosity >= VerbosityLevel.WARNINGS) {
    console.log(`Warning: ${msg}`);
  }
}

function unreachable(msg) {
  throw new Error(msg);
}

function assert(cond, msg) {
  if (!cond) {
    unreachable(msg);
  }
}

// Checks if URLs have the same origin. For non-HTTP based URLs, returns false.
function isSameOrigin(baseUrl, otherUrl) {
  let base;
  try {
    base = new URL(baseUrl);
    if (!base.origin || base.origin === "null") {
      return false; // non-HTTP url
    }
  } catch (e) {
    return false;
  }

  const other = new URL(otherUrl, base);
  return base.origin === other.origin;
}

// Checks if URLs use one of the allowed protocols, e.g. to avoid XSS.
function _isValidProtocol(url) {
  if (!url) {
    return false;
  }
  switch (url.protocol) {
    case "http:":
    case "https:":
    case "ftp:":
    case "mailto:":
    case "tel:":
      return true;
    default:
      return false;
  }
}

/**
 * Attempts to create a valid absolute URL.
 *
 * @param {URL|string} url - An absolute, or relative, URL.
 * @param {URL|string} [baseUrl] - An absolute URL.
 * @param {Object} [options]
 * @returns Either a valid {URL}, or `null` otherwise.
 */
function createValidAbsoluteUrl(url, baseUrl = null, options = null) {
  if (!url) {
    return null;
  }
  try {
    if (options && typeof url === "string") {
      // Let URLs beginning with "www." default to using the "http://" protocol.
      if (options.addDefaultProtocol && url.startsWith("www.")) {
        const dots = url.match(/\./g);
        // Avoid accidentally matching a *relative* URL pointing to a file named
        // e.g. "www.pdf" or similar.
        if (dots && dots.length >= 2) {
          url = `http://${url}`;
        }
      }

      // According to ISO 32000-1:2008, section 12.6.4.7, URIs should be encoded
      // in 7-bit ASCII. Some bad PDFs use UTF-8 encoding; see bug 1122280.
      if (options.tryConvertEncoding) {
        try {
          url = stringToUTF8String(url);
        } catch (ex) {}
      }
    }

    const absoluteUrl = baseUrl ? new URL(url, baseUrl) : new URL(url);
    if (_isValidProtocol(absoluteUrl)) {
      return absoluteUrl;
    }
  } catch (ex) {
    /* `new URL()` will throw on incorrect data. */
  }
  return null;
}

function shadow(obj, prop, value) {
  if (
    typeof PDFJSDev === "undefined" ||
    PDFJSDev.test("!PRODUCTION || TESTING")
  ) {
    assert(
      prop in obj,
      `shadow: Property "${prop && prop.toString()}" not found in object.`
    );
  }
  Object.defineProperty(obj, prop, {
    value,
    enumerable: true,
    configurable: true,
    writable: false,
  });
  return value;
}

/**
 * @type {any}
 */
const BaseException = (function BaseExceptionClosure() {
  // eslint-disable-next-line no-shadow
  function BaseException(message, name) {
    if (this.constructor === BaseException) {
      unreachable("Cannot initialize BaseException.");
    }
    this.message = message;
    this.name = name;
  }
  BaseException.prototype = new Error();
  BaseException.constructor = BaseException;

  return BaseException;
})();

class PasswordException extends BaseException {
  constructor(msg, code) {
    super(msg, "PasswordException");
    this.code = code;
  }
}

class UnknownErrorException extends BaseException {
  constructor(msg, details) {
    super(msg, "UnknownErrorException");
    this.details = details;
  }
}

class InvalidPDFException extends BaseException {
  constructor(msg) {
    super(msg, "InvalidPDFException");
  }
}

class MissingPDFException extends BaseException {
  constructor(msg) {
    super(msg, "MissingPDFException");
  }
}

class UnexpectedResponseException extends BaseException {
  constructor(msg, status) {
    super(msg, "UnexpectedResponseException");
    this.status = status;
  }
}

/**
 * Error caused during parsing PDF data.
 */
class FormatError extends BaseException {
  constructor(msg) {
    super(msg, "FormatError");
  }
}

/**
 * Error used to indicate task cancellation.
 */
class AbortException extends BaseException {
  constructor(msg) {
    super(msg, "AbortException");
  }
}

const NullCharactersRegExp = /\x00+/g;
const InvisibleCharactersRegExp = /[\x01-\x1F]/g;

/**
 * @param {string} str
 */
function removeNullCharacters(str, replaceInvisible = false) {
  if (typeof str !== "string") {
    warn("The argument for removeNullCharacters must be a string.");
    return str;
  }
  if (replaceInvisible) {
    str = str.replace(InvisibleCharactersRegExp, " ");
  }
  return str.replace(NullCharactersRegExp, "");
}

function bytesToString(bytes) {
  assert(
    bytes !== null && typeof bytes === "object" && bytes.length !== undefined,
    "Invalid argument for bytesToString"
  );
  const length = bytes.length;
  const MAX_ARGUMENT_COUNT = 8192;
  if (length < MAX_ARGUMENT_COUNT) {
    return String.fromCharCode.apply(null, bytes);
  }
  const strBuf = [];
  for (let i = 0; i < length; i += MAX_ARGUMENT_COUNT) {
    const chunkEnd = Math.min(i + MAX_ARGUMENT_COUNT, length);
    const chunk = bytes.subarray(i, chunkEnd);
    strBuf.push(String.fromCharCode.apply(null, chunk));
  }
  return strBuf.join("");
}

function stringToBytes(str) {
  assert(typeof str === "string", "Invalid argument for stringToBytes");
  const length = str.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; ++i) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return bytes;
}

/**
 * Gets length of the array (Array, Uint8Array, or string) in bytes.
 * @param {Array<any>|Uint8Array|string} arr
 * @returns {number}
 */
function arrayByteLength(arr) {
  if (arr.length !== undefined) {
    return arr.length;
  }
  assert(arr.byteLength !== undefined, "arrayByteLength - invalid argument.");
  return arr.byteLength;
}

/**
 * Combines array items (arrays) into single Uint8Array object.
 * @param {Array<Array<any>|Uint8Array|string>} arr - the array of the arrays
 *   (Array, Uint8Array, or string).
 * @returns {Uint8Array}
 */
function arraysToBytes(arr) {
  const length = arr.length;
  // Shortcut: if first and only item is Uint8Array, return it.
  if (length === 1 && arr[0] instanceof Uint8Array) {
    return arr[0];
  }
  let resultLength = 0;
  for (let i = 0; i < length; i++) {
    resultLength += arrayByteLength(arr[i]);
  }
  let pos = 0;
  const data = new Uint8Array(resultLength);
  for (let i = 0; i < length; i++) {
    let item = arr[i];
    if (!(item instanceof Uint8Array)) {
      if (typeof item === "string") {
        item = stringToBytes(item);
      } else {
        item = new Uint8Array(item);
      }
    }
    const itemLength = item.byteLength;
    data.set(item, pos);
    pos += itemLength;
  }
  return data;
}

function string32(value) {
  if (
    typeof PDFJSDev === "undefined" ||
    PDFJSDev.test("!PRODUCTION || TESTING")
  ) {
    assert(
      typeof value === "number" && Math.abs(value) < 2 ** 32,
      `string32: Unexpected input "${value}".`
    );
  }
  return String.fromCharCode(
    (value >> 24) & 0xff,
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff
  );
}

function objectSize(obj) {
  return Object.keys(obj).length;
}

// Ensure that the returned Object has a `null` prototype; hence why
// `Object.fromEntries(...)` is not used.
function objectFromMap(map) {
  const obj = Object.create(null);
  for (const [key, value] of map) {
    obj[key] = value;
  }
  return obj;
}

// Checks the endianness of the platform.
function isLittleEndian() {
  const buffer8 = new Uint8Array(4);
  buffer8[0] = 1;
  const view32 = new Uint32Array(buffer8.buffer, 0, 1);
  return view32[0] === 1;
}
const IsLittleEndianCached = {
  get value() {
    return shadow(this, "value", isLittleEndian());
  },
};

// Checks if it's possible to eval JS expressions.
function isEvalSupported() {
  try {
    new Function(""); // eslint-disable-line no-new, no-new-func
    return true;
  } catch (e) {
    return false;
  }
}
const IsEvalSupportedCached = {
  get value() {
    return shadow(this, "value", isEvalSupported());
  },
};

const hexNumbers = [...Array(256).keys()].map(n =>
  n.toString(16).padStart(2, "0")
);

class Util {
  static makeHexColor(r, g, b) {
    return `#${hexNumbers[r]}${hexNumbers[g]}${hexNumbers[b]}`;
  }

  // Concatenates two transformation matrices together and returns the result.
  static transform(m1, m2) {
    return [
      m1[0] * m2[0] + m1[2] * m2[1],
      m1[1] * m2[0] + m1[3] * m2[1],
      m1[0] * m2[2] + m1[2] * m2[3],
      m1[1] * m2[2] + m1[3] * m2[3],
      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
      m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
    ];
  }

  // For 2d affine transforms
  static applyTransform(p, m) {
    const xt = p[0] * m[0] + p[1] * m[2] + m[4];
    const yt = p[0] * m[1] + p[1] * m[3] + m[5];
    return [xt, yt];
  }

  static applyInverseTransform(p, m) {
    const d = m[0] * m[3] - m[1] * m[2];
    const xt = (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[4] * m[3]) / d;
    const yt = (-p[0] * m[1] + p[1] * m[0] + m[4] * m[1] - m[5] * m[0]) / d;
    return [xt, yt];
  }

  // Applies the transform to the rectangle and finds the minimum axially
  // aligned bounding box.
  static getAxialAlignedBoundingBox(r, m) {
    const p1 = Util.applyTransform(r, m);
    const p2 = Util.applyTransform(r.slice(2, 4), m);
    const p3 = Util.applyTransform([r[0], r[3]], m);
    const p4 = Util.applyTransform([r[2], r[1]], m);
    return [
      Math.min(p1[0], p2[0], p3[0], p4[0]),
      Math.min(p1[1], p2[1], p3[1], p4[1]),
      Math.max(p1[0], p2[0], p3[0], p4[0]),
      Math.max(p1[1], p2[1], p3[1], p4[1]),
    ];
  }

  static inverseTransform(m) {
    const d = m[0] * m[3] - m[1] * m[2];
    return [
      m[3] / d,
      -m[1] / d,
      -m[2] / d,
      m[0] / d,
      (m[2] * m[5] - m[4] * m[3]) / d,
      (m[4] * m[1] - m[5] * m[0]) / d,
    ];
  }

  // Apply a generic 3d matrix M on a 3-vector v:
  //   | a b c |   | X |
  //   | d e f | x | Y |
  //   | g h i |   | Z |
  // M is assumed to be serialized as [a,b,c,d,e,f,g,h,i],
  // with v as [X,Y,Z]
  static apply3dTransform(m, v) {
    return [
      m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
      m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
      m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
    ];
  }

  // This calculation uses Singular Value Decomposition.
  // The SVD can be represented with formula A = USV. We are interested in the
  // matrix S here because it represents the scale values.
  static singularValueDecompose2dScale(m) {
    const transpose = [m[0], m[2], m[1], m[3]];

    // Multiply matrix m with its transpose.
    const a = m[0] * transpose[0] + m[1] * transpose[2];
    const b = m[0] * transpose[1] + m[1] * transpose[3];
    const c = m[2] * transpose[0] + m[3] * transpose[2];
    const d = m[2] * transpose[1] + m[3] * transpose[3];

    // Solve the second degree polynomial to get roots.
    const first = (a + d) / 2;
    const second = Math.sqrt((a + d) ** 2 - 4 * (a * d - c * b)) / 2;
    const sx = first + second || 1;
    const sy = first - second || 1;

    // Scale values are the square roots of the eigenvalues.
    return [Math.sqrt(sx), Math.sqrt(sy)];
  }

  // Normalize rectangle rect=[x1, y1, x2, y2] so that (x1,y1) < (x2,y2)
  // For coordinate systems whose origin lies in the bottom-left, this
  // means normalization to (BL,TR) ordering. For systems with origin in the
  // top-left, this means (TL,BR) ordering.
  static normalizeRect(rect) {
    const r = rect.slice(0); // clone rect
    if (rect[0] > rect[2]) {
      r[0] = rect[2];
      r[2] = rect[0];
    }
    if (rect[1] > rect[3]) {
      r[1] = rect[3];
      r[3] = rect[1];
    }
    return r;
  }

  // Returns a rectangle [x1, y1, x2, y2] corresponding to the
  // intersection of rect1 and rect2. If no intersection, returns 'false'
  // The rectangle coordinates of rect1, rect2 should be [x1, y1, x2, y2]
  static intersect(rect1, rect2) {
    function compare(a, b) {
      return a - b;
    }

    // Order points along the axes
    const orderedX = [rect1[0], rect1[2], rect2[0], rect2[2]].sort(compare);
    const orderedY = [rect1[1], rect1[3], rect2[1], rect2[3]].sort(compare);
    const result = [];

    rect1 = Util.normalizeRect(rect1);
    rect2 = Util.normalizeRect(rect2);

    // X: first and second points belong to different rectangles?
    if (
      (orderedX[0] === rect1[0] && orderedX[1] === rect2[0]) ||
      (orderedX[0] === rect2[0] && orderedX[1] === rect1[0])
    ) {
      // Intersection must be between second and third points
      result[0] = orderedX[1];
      result[2] = orderedX[2];
    } else {
      return null;
    }

    // Y: first and second points belong to different rectangles?
    if (
      (orderedY[0] === rect1[1] && orderedY[1] === rect2[1]) ||
      (orderedY[0] === rect2[1] && orderedY[1] === rect1[1])
    ) {
      // Intersection must be between second and third points
      result[1] = orderedY[1];
      result[3] = orderedY[2];
    } else {
      return null;
    }

    return result;
  }

  // From https://github.com/adobe-webplatform/Snap.svg/blob/b365287722a72526000ac4bfcf0ce4cac2faa015/src/path.js#L852
  static bezierBoundingBox(x0, y0, x1, y1, x2, y2, x3, y3) {
    const tvalues = [],
      bounds = [[], []];
    let a, b, c, t, t1, t2, b2ac, sqrtb2ac;
    for (let i = 0; i < 2; ++i) {
      if (i === 0) {
        b = 6 * x0 - 12 * x1 + 6 * x2;
        a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
        c = 3 * x1 - 3 * x0;
      } else {
        b = 6 * y0 - 12 * y1 + 6 * y2;
        a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
        c = 3 * y1 - 3 * y0;
      }
      if (Math.abs(a) < 1e-12) {
        if (Math.abs(b) < 1e-12) {
          continue;
        }
        t = -c / b;
        if (0 < t && t < 1) {
          tvalues.push(t);
        }
        continue;
      }
      b2ac = b * b - 4 * c * a;
      sqrtb2ac = Math.sqrt(b2ac);
      if (b2ac < 0) {
        continue;
      }
      t1 = (-b + sqrtb2ac) / (2 * a);
      if (0 < t1 && t1 < 1) {
        tvalues.push(t1);
      }
      t2 = (-b - sqrtb2ac) / (2 * a);
      if (0 < t2 && t2 < 1) {
        tvalues.push(t2);
      }
    }

    let j = tvalues.length,
      mt;
    const jlen = j;
    while (j--) {
      t = tvalues[j];
      mt = 1 - t;
      bounds[0][j] =
        mt * mt * mt * x0 +
        3 * mt * mt * t * x1 +
        3 * mt * t * t * x2 +
        t * t * t * x3;
      bounds[1][j] =
        mt * mt * mt * y0 +
        3 * mt * mt * t * y1 +
        3 * mt * t * t * y2 +
        t * t * t * y3;
    }

    bounds[0][jlen] = x0;
    bounds[1][jlen] = y0;
    bounds[0][jlen + 1] = x3;
    bounds[1][jlen + 1] = y3;
    bounds[0].length = bounds[1].length = jlen + 2;

    return [
      Math.min(...bounds[0]),
      Math.min(...bounds[1]),
      Math.max(...bounds[0]),
      Math.max(...bounds[1]),
    ];
  }
}

const PDFStringTranslateTable = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x2d8,
  0x2c7, 0x2c6, 0x2d9, 0x2dd, 0x2db, 0x2da, 0x2dc, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0x2022, 0x2020, 0x2021, 0x2026, 0x2014, 0x2013, 0x192,
  0x2044, 0x2039, 0x203a, 0x2212, 0x2030, 0x201e, 0x201c, 0x201d, 0x2018,
  0x2019, 0x201a, 0x2122, 0xfb01, 0xfb02, 0x141, 0x152, 0x160, 0x178, 0x17d,
  0x131, 0x142, 0x153, 0x161, 0x17e, 0, 0x20ac,
];

function stringToPDFString(str) {
  const length = str.length,
    strBuf = [];
  if (str[0] === "\xFE" && str[1] === "\xFF") {
    // UTF16BE BOM
    for (let i = 2; i < length; i += 2) {
      strBuf.push(
        String.fromCharCode((str.charCodeAt(i) << 8) | str.charCodeAt(i + 1))
      );
    }
  } else if (str[0] === "\xFF" && str[1] === "\xFE") {
    // UTF16LE BOM
    for (let i = 2; i < length; i += 2) {
      strBuf.push(
        String.fromCharCode((str.charCodeAt(i + 1) << 8) | str.charCodeAt(i))
      );
    }
  } else {
    for (let i = 0; i < length; ++i) {
      const code = PDFStringTranslateTable[str.charCodeAt(i)];
      strBuf.push(code ? String.fromCharCode(code) : str.charAt(i));
    }
  }
  return strBuf.join("");
}

function escapeString(str) {
  // replace "(", ")", "\n", "\r" and "\"
  // by "\(", "\)", "\\n", "\\r" and "\\"
  // in order to write it in a PDF file.
  return str.replace(/([()\\\n\r])/g, match => {
    if (match === "\n") {
      return "\\n";
    } else if (match === "\r") {
      return "\\r";
    }
    return `\\${match}`;
  });
}

function isAscii(str) {
  return /^[\x00-\x7F]*$/.test(str);
}

function stringToUTF16BEString(str) {
  const buf = ["\xFE\xFF"];
  for (let i = 0, ii = str.length; i < ii; i++) {
    const char = str.charCodeAt(i);
    buf.push(
      String.fromCharCode((char >> 8) & 0xff),
      String.fromCharCode(char & 0xff)
    );
  }
  return buf.join("");
}

function stringToUTF8String(str) {
  return decodeURIComponent(escape(str));
}

function utf8StringToString(str) {
  return unescape(encodeURIComponent(str));
}

function isBool(v) {
  return typeof v === "boolean";
}

function isNum(v) {
  return typeof v === "number";
}

function isString(v) {
  return typeof v === "string";
}

function isArrayBuffer(v) {
  return typeof v === "object" && v !== null && v.byteLength !== undefined;
}

function isArrayEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0, ii = arr1.length; i < ii; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

function getModificationDate(date = new Date()) {
  const buffer = [
    date.getUTCFullYear().toString(),
    (date.getUTCMonth() + 1).toString().padStart(2, "0"),
    date.getUTCDate().toString().padStart(2, "0"),
    date.getUTCHours().toString().padStart(2, "0"),
    date.getUTCMinutes().toString().padStart(2, "0"),
    date.getUTCSeconds().toString().padStart(2, "0"),
  ];

  return buffer.join("");
}

/**
 * Promise Capability object.
 *
 * @typedef {Object} PromiseCapability
 * @property {Promise<any>} promise - A Promise object.
 * @property {boolean} settled - If the Promise has been fulfilled/rejected.
 * @property {function} resolve - Fulfills the Promise.
 * @property {function} reject - Rejects the Promise.
 */

/**
 * Creates a promise capability object.
 * @alias createPromiseCapability
 *
 * @returns {PromiseCapability}
 */
function createPromiseCapability() {
  const capability = Object.create(null);
  let isSettled = false;

  Object.defineProperty(capability, "settled", {
    get() {
      return isSettled;
    },
  });
  capability.promise = new Promise(function (resolve, reject) {
    capability.resolve = function (data) {
      isSettled = true;
      resolve(data);
    };
    capability.reject = function (reason) {
      isSettled = true;
      reject(reason);
    };
  });
  return capability;
}

function createObjectURL(data, contentType = "", forceDataSchema = false) {
  if (URL.createObjectURL && typeof Blob !== "undefined" && !forceDataSchema) {
    return URL.createObjectURL(new Blob([data], { type: contentType }));
  }
  // Blob/createObjectURL is not available, falling back to data schema.
  const digits =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  let buffer = `data:${contentType};base64,`;
  for (let i = 0, ii = data.length; i < ii; i += 3) {
    const b1 = data[i] & 0xff;
    const b2 = data[i + 1] & 0xff;
    const b3 = data[i + 2] & 0xff;
    const d1 = b1 >> 2,
      d2 = ((b1 & 3) << 4) | (b2 >> 4);
    const d3 = i + 1 < ii ? ((b2 & 0xf) << 2) | (b3 >> 6) : 64;
    const d4 = i + 2 < ii ? b3 & 0x3f : 64;
    buffer += digits[d1] + digits[d2] + digits[d3] + digits[d4];
  }
  return buffer;
}

const FontRenderOps = {
   BEZIER_CURVE_TO: 0,
   MOVE_TO: 1,
   LINE_TO: 2,
   QUADRATIC_CURVE_TO: 3,
   RESTORE: 4,
   SAVE: 5,
   SCALE: 6,
   TRANSFORM: 7,
   TRANSLATE: 8,
 };
 
export {
  AbortException,
  AnnotationActionEventType,
  AnnotationBorderStyleType,
  AnnotationFieldFlag,
  AnnotationFlag,
  AnnotationMarkedState,
  AnnotationMode,
  AnnotationReplyType,
  AnnotationReviewState,
  AnnotationStateModelType,
  AnnotationType,
  arrayByteLength,
  arraysToBytes,
  assert,
  BaseException,
  bytesToString,
  CMapCompressionType,
  createObjectURL,
  createPromiseCapability,
  createValidAbsoluteUrl,
  DocumentActionEventType,
  escapeString,
  FONT_IDENTITY_MATRIX,
  FontRenderOps,
  FontType,
  FormatError,
  getModificationDate,
  getVerbosityLevel,
  IDENTITY_MATRIX,
  ImageKind,
  info,
  InvalidPDFException,
  isArrayBuffer,
  isArrayEqual,
  isAscii,
  isBool,
  IsEvalSupportedCached,
  IsLittleEndianCached,
  isNum,
  isSameOrigin,
  isString,
  MissingPDFException,
  objectFromMap,
  objectSize,
  OPS,
  PageActionEventType,
  PasswordException,
  PasswordResponses,
  PermissionFlag,
  removeNullCharacters,
  RenderingIntentFlag,
  setVerbosityLevel,
  shadow,
  StreamType,
  string32,
  stringToBytes,
  stringToPDFString,
  stringToUTF16BEString,
  stringToUTF8String,
  TextRenderingMode,
  UnexpectedResponseException,
  UnknownErrorException,
  unreachable,
  UNSUPPORTED_FEATURES,
  utf8StringToString,
  Util,
  VerbosityLevel,
  warn,
};
