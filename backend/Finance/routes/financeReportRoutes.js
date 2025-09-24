// backend/Finance/routes/financeReportRoutes.js
const express = require('express');
const {
  generateFinanceReport,
  listFinanceReports,
  getFinanceReport,
} = require('../controllers/financeReportController');

const router = express.Router();

router.post('/generate', generateFinanceReport);
router.get('/', listFinanceReports);
router.get('/:id', getFinanceReport);

module.exports = router;