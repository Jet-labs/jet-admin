const express = require("express");
const { dbModel } = require("../../config/prisma");
const router = express.Router();

// get all data of table
router.get("/admin", async (req, res) => {
  return res.json({
    success: true,
    constants: {
      db_model: dbModel,
    },
  });
});

module.exports = router;
