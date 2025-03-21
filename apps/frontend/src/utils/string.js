export class StringUtils {
  static truncateName = (str, length) => {
    return str.length > length ? `${str.substring(0, length)}...` : str;
  };
  static containsWhitespace = (str) => /\s/.test(str);
  static getImageSizeInKB = (base64Image) => {
    const yourBase64String = base64Image.substring(
      base64Image.indexOf(",") + 1
    );
    return Math.ceil((yourBase64String.length * 6) / 8 / 1000);
  };
}

