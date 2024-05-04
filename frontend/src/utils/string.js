export const jsonToReadable = (data) => {
  return data
    ? Object.entries(data).reduce((result, [key, value]) => {
        key = key
          .replace(/([A-Z]|\d+)/g, " $1")
          .replace(/^(.)/, (unused, p1) => p1.toUpperCase());
        if (typeof value == "object") {
          value = jsonToReadable(value);
        } else if (!["string", "number", "boolean"].includes(typeof value)) {
          value = Object.entries(value)
            .map(([key, value]) =>
              typeof value == "boolean" ? (value ? key : undefined) : value
            )
            .filter((v) => v !== undefined);
          result.concat(value);
        }
        result.push(`${key}: ${value}`);
        return result;
      }, [])
    : null;
};
