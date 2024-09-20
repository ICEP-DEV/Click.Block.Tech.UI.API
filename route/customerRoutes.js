const express = require('express');
const { createCustomer, getCustomer, verifyPhoneNumber} = require('../controllers/customerController');

const router = express.Router();

router.post('/customer', createCustomer);  
router.get('/customer/:custID_Nr', getCustomer);
router.post('/verifyPhone', verifyPhoneNumber);  


module.exports = router;
