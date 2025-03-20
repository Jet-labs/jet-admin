export class StringUtils {
  static truncateName = (str, length) => {
    return str.length > length ? `${str.substring(0, length)}...` : str;
  };
  static containsWhitespace = (str) => /\s/.test(str);
}
