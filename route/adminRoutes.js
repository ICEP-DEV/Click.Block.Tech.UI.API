const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

// Admin routes
router.post('/admin', AdminController.createAdmin);
router.post('/admin/login', AdminController.login);
router.get('/admin/:id', AdminController.getAdmin);
router.put('/admin/:id', AdminController.updateAdmin);
router.delete('/admin/:id', AdminController.deleteAdmin);
router.get('/getAll_Alert',AdminController.getAllAlerts);
router.get('/getLocationbyID/:locationID', AdminController.getLocationByID);
router.patch('/updatePanicStatus/:custIdNr', AdminController.updateCustomerPanicStatus);
router.get('/getAllActivatedPanic', AdminController.getActivatedPanic);

module.exports = router;


