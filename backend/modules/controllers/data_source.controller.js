const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
const { DataSourceService } = require("../services/data_source.services");

const dataSourceController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
dataSourceController.getAllDataSources = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_data_sources = state.authorized_data_sources;

    Logger.log("info", {
      message: "dataSourceController:getAllDataSources:params",
      params: { pm_user_id },
    });

    const dataSources = await DataSourceService.getAllDataSources({
      authorizedDataSources: authorized_data_sources,
    });

    Logger.log("success", {
      message: "dataSourceController:getAllDataSources:success",
      params: { pm_user_id, dataSources },
    });

    return res.json({
      success: true,
      dataSources: dataSources,
    });
  } catch (error) {
    Logger.log("error", {
      message: "dataSourceController:getAllDataSources:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
dataSourceController.runPGQueryDataSource = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const {query} = body;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_data_sources = state.authorized_data_sources;

    Logger.log("info", {
      message: "dataSourceController:runPGQueryDataSource:params",
      params: { pm_user_id,query },
    });

    const data = await DataSourceService.runPGQueryDataSource({
      query
    });

    Logger.log("success", {
      message: "dataSourceController:runPGQueryDataSource:success",
      params: { pm_user_id, data },
    });

    return res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    Logger.log("error", {
      message: "dataSourceController:runPGQueryDataSource:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

// /**
//  *
//  * @param {import("express").Request} req
//  * @param {import("express").Response} res
//  * @returns
//  */
// dataSourceController.getDataSourceByID = async (req, res) => {
//   try {
//     const { pmUser, state, params } = req;
//     const pm_dataSource_id = parseInt(params.id);
//     const pm_user_id = parseInt(pmUser.pm_user_id);
//     const authorized_data_sources = state.authorized_data_sources;

//     Logger.log("info", {
//       message: "dataSourceController:getDataSourceByID:params",
//       params: { pm_user_id, pm_dataSource_id },
//     });

//     const dataSource = await DataSourceService.getDataSourceByID({
//       dataSourceID: pm_dataSource_id,
//       authorizedDataSources: authorized_data_sources,
//     });

//     Logger.log("success", {
//       message: "dataSourceController:getDataSourceByID:success",
//       params: { pm_user_id, dataSource },
//     });

//     return res.json({
//       success: true,
//       dataSource: dataSource,
//     });
//   } catch (error) {
//     Logger.log("error", {
//       message: "dataSourceController:getDataSourceByID:catch-1",
//       params: { error },
//     });
//     return res.json({ success: false, error: extractError(error) });
//   }
// };

// /**
//  *
//  * @param {import("express").Request} req
//  * @param {import("express").Response} res
//  * @returns
//  */
// dataSourceController.addDataSource = async (req, res) => {
//   try {
//     const { pmUser, state, body } = req;
//     const pm_user_id = parseInt(pmUser.pm_user_id);

//     Logger.log("info", {
//       message: "dataSourceController:addDataSource:params",
//       params: { pm_user_id, body },
//     });

//     const dataSource = await DataSourceService.addDataSource({
//       dataSourceTitle: body.dataSource_title,
//       dataSourceDescription: body.dataSource_description,
//       dataSourceOptions: body.dataSource_options,
//     });

//     Logger.log("success", {
//       message: "dataSourceController:addDataSource:success",
//       params: { pm_user_id, dataSource },
//     });

//     return res.json({
//       success: true,
//       dataSource,
//     });
//   } catch (error) {
//     Logger.log("error", {
//       message: "dataSourceController:addDataSource:catch-1",
//       params: { error },
//     });
//     return res.json({ success: false, error: extractError(error) });
//   }
// };

// /**
//  *
//  * @param {import("express").Request} req
//  * @param {import("express").Response} res
//  * @returns
//  */
// dataSourceController.updateDataSource = async (req, res) => {
//   try {
//     const { pmUser, state, body } = req;
//     const pm_user_id = parseInt(pmUser.pm_user_id);
//     const authorized_data_sources = state.authorized_data_sources;

//     Logger.log("info", {
//       message: "dataSourceController:updateDataSource:params",
//       params: { pm_user_id, body },
//     });

//     const dataSource = await DataSourceService.updateDataSource({
//       dataSourceID: parseInt(body.pm_dataSource_id),
//       dataSourceTitle: body.dataSource_title,
//       dataSourceDescription: body.dataSource_description,
//       dataSourceOptions: body.dataSource_options,
//       authorizedDataSources: authorized_data_sources,
//     });

//     Logger.log("success", {
//       message: "dataSourceController:updateDataSource:success",
//       params: { pm_user_id, dataSource },
//     });

//     return res.json({
//       success: true,
//       dataSource,
//     });
//   } catch (error) {
//     Logger.log("error", {
//       message: "dataSourceController:updateDataSource:catch-1",
//       params: { error },
//     });
//     return res.json({ success: false, error: extractError(error) });
//   }
// };

// /**
//  *
//  * @param {import("express").Request} req
//  * @param {import("express").Response} res
//  * @returns
//  */
// dataSourceController.deleteDataSource = async (req, res) => {
//   try {
//     const { pmUser, state, params } = req;
//     const pm_dataSource_id = parseInt(params.id);
//     const pm_user_id = parseInt(pmUser.pm_user_id);
//     const authorized_data_sources = state.authorized_data_sources;

//     Logger.log("info", {
//       message: "dataSourceController:deleteDataSource:params",
//       params: { pm_user_id, pm_dataSource_id },
//     });

//     await DataSourceService.deleteDataSource({
//       dataSourceID: pm_dataSource_id,
//       authorizedDataSources: authorized_data_sources,
//     });

//     Logger.log("success", {
//       message: "dataSourceController:deleteDataSource:success",
//       params: { pm_user_id },
//     });

//     return res.json({
//       success: true,
//     });
//   } catch (error) {
//     Logger.log("error", {
//       message: "dataSourceController:deleteDataSource:catch-1",
//       params: { error },
//     });
//     return res.json({ success: false, error: extractError(error) });
//   }
// };

module.exports = { dataSourceController };
