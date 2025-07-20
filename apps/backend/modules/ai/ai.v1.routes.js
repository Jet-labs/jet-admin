const express = require("express");
const router = express.Router({mergeParams:true});
const { authMiddleware } = require("../auth/auth.middleware");
const { expressUtils } = require("../../utils/express.utils");
const {v4: uuid } = require("uuid")

router.get(
  "/chat_room",
  authMiddleware.checkUserPermissions(["tenant:ai:create"]),
  (req, res) => {
    return expressUtils.sendResponse(res, true, {
      chatRoomID: uuid(),
    });
  }
);



module.exports = router;
