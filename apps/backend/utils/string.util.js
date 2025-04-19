const stringUtil = {};

stringUtil.truncateName = (str, length) => {
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

stringUtil.containsWhitespace = (str) => /\s/.test(str);

/**
 * Removes leading/trailing markdown code fences (``` or ```sql) from a string using regex.
 * Handles surrounding whitespace and potential newlines near fences.
 *
 * @param {string | null | undefined} inputText The string to process.
 * @returns {string} The processed string with fences removed, or an empty string for invalid input.
 */
stringUtil.removeSQLMarkdownFencesRegex = (inputText) => {
  // 1. Handle invalid input
  if (!inputText || typeof inputText !== "string") {
    return "";
  }

  // 2. Trim leading/trailing whitespace
  const trimmedText = inputText.trim();

  // 3. Define the regex pattern:
  //    ^                  - Start of the trimmed string
  //    ```(?:sql)?       - Match ``` followed optionally by 'sql' (non-capturing group)
  //    \s* - Optional whitespace after fence/language tag
  //    \n?                - Optional newline right after opening fence
  //    (                  - Start capturing group 1 (the actual content)
  //      [\s\S]*?         - Match any character (including newlines) non-greedily
  //    )                  - End capturing group 1
  //    \n?                - Optional newline right before closing fence
  //    \s* - Optional whitespace before closing fence
  //    ```                - Match the closing fence
  //    $                  - End of the trimmed string
  const regex = /^```(?:sql)?\s*\n?([\s\S]*?)\n?\s*```$/;

  // 4. Try to match the pattern
  const match = trimmedText.match(regex);

  // 5. Return the result
  if (match && match[1] !== undefined) {
    // If the pattern matched, return the captured group (content inside), trimmed.
    return match[1].trim();
  } else {
    // If the pattern didn't match (no fences found), return the original trimmed text.
    return trimmedText;
  }
};

/**
 * Removes leading/trailing markdown code fences (``` or ```json) from a string using regex.
 * Handles surrounding whitespace and potential newlines near fences.
 *
 * @param {string | null | undefined} inputText The string to process.
 * @returns {string} The processed string with fences removed, or an empty string for invalid input.
 */
stringUtil.removeJSONMarkdownFencesRegex = (inputText) => {
  // 1. Handle invalid input
  if (!inputText || typeof inputText !== "string") {
    return "";
  }

  // 2. Trim leading/trailing whitespace
  const trimmedText = inputText.trim();

  // 3. Define the regex pattern:
  //    ^                  - Start of the trimmed string
  //    ```(?:json)?       - Match ``` followed optionally by 'json' (non-capturing group)
  //    \s* - Optional whitespace after fence/language tag
  //    \n?                - Optional newline right after opening fence
  //    (                  - Start capturing group 1 (the actual content)
  //      [\s\S]*?         - Match any character (including newlines) non-greedily
  //    )                  - End capturing group 1
  //    \n?                - Optional newline right before closing fence
  //    \s* - Optional whitespace before closing fence
  //    ```                - Match the closing fence
  //    $                  - End of the trimmed string
  const regex = /^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/;

  // 4. Try to match the pattern
  const match = trimmedText.match(regex);

  // 5. Return the result
  if (match && match[1] !== undefined) {
    // If the pattern matched, return the captured group (content inside), trimmed.
    return match[1].trim();
  } else {
    // If the pattern didn't match (no fences found), return the original trimmed text.
    return trimmedText;
  }
};

module.exports = { stringUtil };
