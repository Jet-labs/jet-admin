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
  static removeJSONMarkdownFencesRegex = (inputText) => {
    // 1. Handle invalid input
    if (!inputText || typeof inputText !== "string") {
      return null;
    }

    // 2. Trim leading/trailing whitespace
    const trimmedText = inputText.trim();

    // 3. Define the regex pattern to match markdown JSON fences
    //    ^                  - Start of the string
    //    ```(?:json)?       - Match ``` followed optionally by 'json'
    //    \s*                - Optional whitespace after fence
    //    \n?                - Optional newline after opening fence
    //    ([\s\S]*?)         - Capture any content (non-greedy)
    //    \n?                - Optional newline before closing fence
    //    \s*                - Optional whitespace before closing fence
    //    ```                - Closing fence
    //    $                  - End of the string
    const regex = /^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/;

    // 4. Try to match the pattern
    const match = trimmedText.match(regex);

    // 5. Determine the content to parse
    let content;
    if (match && match[1] !== undefined) {
      content = match[1].trim();
    } else {
      content = trimmedText;
    }

    // 6. Attempt to parse the content as JSON
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return null;
    }
  };
  static revertJSONToMarkdown(jsonObj) {
    // 1. Handle invalid input: undefined or non-serializable values
    if (jsonObj === undefined) {
      return "";
    }

    try {
      // 2. Convert the object to a pretty-printed JSON string
      const jsonString = JSON.stringify(jsonObj, null, 2);

      // 3. Handle cases where JSON.stringify returns undefined (e.g., functions)
      if (jsonString === undefined) {
        return "";
      }

      // 4. Wrap the JSON string in markdown code fences
      return "```json\n" + jsonString + "\n```";
    } catch (e) {
      // 5. Handle serialization errors (e.g., circular references)
      return "";
    }
  }
}

