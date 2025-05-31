export const keyValueTypeArrayToObject = (keyValueTypeArray) => {
  let obj = {};
  keyValueTypeArray.forEach((item) => {
    switch (item.type) {
      case "string":
        obj[item.key] = String(item.value);
        break;
      case "number":
        obj[item.key] = Number(item.value);
        break;
      case "boolean":
        obj[item.key] = item.value === "true";
        break;
      case "object":
        try {
          obj[item.key] = JSON.parse(item.value);
        } catch (e) {
          obj[item.key] = null;
        }
        break;
      default:
        obj[item.key] = item.value;
        break;
    }
  });
  return obj;
};
