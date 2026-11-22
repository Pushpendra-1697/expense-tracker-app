const express = require('express');
const {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportCsv,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  createTransactionValidator,
  updateTransactionValidator,
  listTransactionValidator,
} = require('../validators/transactionValidators');

const router = express.Router();

router.use(protect);

router.get('/export/csv', listTransactionValidator, validate, exportCsv);
router.get('/', listTransactionValidator, validate, listTransactions);
router.get('/:id', getTransaction);
router.post('/', upload.single('attachment'), createTransactionValidator, validate, createTransaction);
router.put('/:id', upload.single('attachment'), updateTransactionValidator, validate, updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
