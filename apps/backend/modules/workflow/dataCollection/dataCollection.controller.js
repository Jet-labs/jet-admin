const { dataCollectionService } = require('./dataCollection.service');
const Logger = require("../../../utils/logger");
const { expressUtils } = require("../../../utils/express.utils");

const dataCollectionController = {};

dataCollectionController.submitData = async (req, res) => {
    try {
        const { collectionRequestID } = req.params;
        const { submittedData } = req.body;

        Logger.log('info', {
            message: 'dataCollectionController:submitData',
            params: { collectionRequestID },
        });

        if (!submittedData || typeof submittedData !== 'object') {
            return expressUtils.sendResponse(
                res, false, {}, { message: 'submittedData must be a non-null object' }
            );
        }

        const result = await dataCollectionService.submitCollectionData({
            collectionRequestID,
            submittedData,
        });

        Logger.log('success', {
            message: 'dataCollectionController:submitData:success',
            params: { collectionRequestID },
        });
        expressUtils.sendResponse(res, true, result);

    } catch (error) {
        Logger.log('error', {
            message: 'dataCollectionController:submitData:error',
            params: { error: error.message },
        });
        expressUtils.sendResponse(res, false, {}, error);
    }
};

dataCollectionController.getRequest = async (req, res) => {
    try {
        const { collectionRequestID } = req.params;
        const request = await dataCollectionService.getCollectionRequest({ collectionRequestID });
        expressUtils.sendResponse(res, true, { request });
    } catch (error) {
        expressUtils.sendResponse(res, false, {}, error);
    }
};

module.exports = { dataCollectionController };