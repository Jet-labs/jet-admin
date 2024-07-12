class StringUtils {
  constructor() {}
  static trimEnd = (str, ch) => {
    let chs = str.split("");
    let end = chs.length;
    while (--end >= 0) {
      if (chs[end] === ch) {
        continue;
      } else {
        break;
      }
    }
    return chs.slice(0, end + 1).join("");
  };
}

module.exports = { StringUtils };
