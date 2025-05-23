var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  DATASOURCE_TYPES: () => DATASOURCE_TYPES
});
module.exports = __toCommonJS(index_exports);
var DATASOURCE_TYPES = {
  POSTGRESQL: {
    name: "PostgreSQL",
    value: "postgresql"
  },
  MYSQL: {
    name: "MySQL",
    value: "mysql"
  },
  MSSQL: {
    name: "MSSQL",
    value: "mssql"
  },
  RESTAPI: {
    name: "REST API",
    value: "restapi"
  }
};
//# sourceMappingURL=index.cjs.map
