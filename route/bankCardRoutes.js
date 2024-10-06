const express = require('express');
const router = express.Router();
const bankCardController = require('../controllers/bankCardController');

// Route to create a new bank card
router.post('/bankcards', bankCardController.createBankCard);

// Route to get a specific bank card by ID
router.get('/bankcards/:cardID', bankCardController.getBankCard);

// Route to update a bank card by ID
router.put('/bankcards/:cardID', bankCardController.updateBankCard);

// Route to delete a bank card by ID
router.delete('/bankcards/:cardID', bankCardController.deleteBankCard);

// Route to get bank cards by Account ID
router.get('/accounts/:accountID/bankcards', bankCardController.getCardsByAccountID);

//Route to get Customer details for associated card
router.get('/bankcards/:cardID/customer', bankCardController.getCustomerByCardID);

module.exports = router;
