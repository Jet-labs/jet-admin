export class StringUtils {
  static truncateName = (str, length) => {
    return str.length > length ? `${str.substring(0, length)}...` : str;
  };

  /**
   * Safely stringifies a JSON object, truncating large arrays and strings
   * to prevent browser freezing when displaying massive data in CodeEditors.
   * Also strips internal React nodes, DOM elements, and functions.
   * @param {any} obj - The object to stringify
   * @param {number} maxArrayLength - Max elements to show in an array (default 50)
   * @param {number} maxStringLength - Max length of strings (default 1000)
   * @param {number} maxNodes - Absolute maximum number of nodes to process (default 5000)
   * @returns {string} - Pretty-printed JSON string
   */
  static safeJsonStringify(obj, maxArrayLength = 50, maxStringLength = 1000, maxNodes = 5000) {
    const cache = new WeakSet();
    let nodeCount = 0;
    let nodeLimitHit = false;

    const truncateString = (str) => {
      if (typeof str === "string" && str.length > maxStringLength) {
        return `${str.substring(0, maxStringLength)}... [Truncated ${str.length - maxStringLength} chars]`;
      }
      return str;
    };

    // Recursively sanitize a value through the full pipeline,
    // so nested structures inside arrays/objects are always cleaned.
    const sanitize = (value, depth = 0) => {
      // Hard depth guard — catches degenerate recursive structures
      if (depth > 50) return "[MaxDepth]";

      if (nodeLimitHit) return `... [Max nodes (${maxNodes}) reached]`;

      nodeCount++;
      if (nodeCount > maxNodes) {
        nodeLimitHit = true;
        return `... [Max nodes (${maxNodes}) reached]`;
      }

      // Primitives
      if (value === null) return null;
      if (typeof value === "undefined") return undefined;
      if (typeof value === "function") return "[Function]";
      if (typeof value === "symbol") return value.toString();
      if (typeof value === "string") return truncateString(value);
      if (typeof value === "number" || typeof value === "boolean") return value;

      // Objects
      if (typeof value === "object") {
        // Circular reference check
        if (cache.has(value)) return "[Circular]";

        // DOM elements — guard against missing HTMLElement in non-browser envs
        if (typeof HTMLElement !== "undefined" && value instanceof HTMLElement) {
          return `[HTMLElement <${value.tagName.toLowerCase()}>]`;
        }

        // React fiber / internal nodes by constructor name
        const ctorName = value.constructor?.name ?? "";
        if (ctorName === "FiberNode" || ctorName === "ReactElement") {
          return "[ReactInternal]";
        }

        cache.add(value);

        // Array
        if (Array.isArray(value)) {
          const visible = value.slice(0, maxArrayLength);
          const result = visible.map((item) => sanitize(item, depth + 1));
          if (value.length > maxArrayLength) {
            result.push(`... [Truncated ${value.length - maxArrayLength} items]`);
          }
          return result;
        }

        // widgetMethods special case
        if ("widgetMethods" in value && typeof value.widgetMethods === "object") {
          // handled below as a normal object; the key-level hook was unreliable
        }

        // Plain object
        const keys = Object.keys(value);
        const visibleKeys = keys.slice(0, maxArrayLength);
        const result = {};

        for (const k of visibleKeys) {
          // Drop React internals
          if (k.startsWith("__react") || k.startsWith("$$typeof")) continue;

          // widgetMethods: collapse to method name lists
          if (k === "widgetMethods") {
            const wm = value[k];
            if (wm && typeof wm === "object") {
              result[k] = Object.fromEntries(
                Object.entries(wm).map(([wid, methods]) => [
                  wid,
                  methods && typeof methods === "object"
                    ? Object.keys(methods).filter((m) => typeof methods[m] === "function")
                    : sanitize(methods, depth + 1),
                ])
              );
            }
            continue;
          }

          result[k] = sanitize(value[k], depth + 1);
        }

        if (keys.length > maxArrayLength) {
          result["_truncated_info"] = `... [Truncated ${keys.length - maxArrayLength} keys]`;
        }

        return result;
      }

      return value;
    };

    try {
      const sanitized = sanitize(obj);
      return JSON.stringify(sanitized, null, 2);
    } catch (e) {
      return `[Error stringifying data: ${e.message}]`;
    }
  }
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

