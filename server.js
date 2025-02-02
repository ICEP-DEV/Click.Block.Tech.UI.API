require('dotenv').config();
const express = require('express');
const cors = require('cors');
const customerRoutes = require('./route/customerRoutes');
const supportingDocumentRoutes = require('./route/supportingDocumentRoutes');
const path = require('path');
const bankAccountRoutes = require('./route/bankAccountRoutes'); 
const bankCardRoutes =  require('./route/bankCardRoutes'); 
const alertPinLogRoutes = require('./route/alertPinLogRoutes');
const adminRoutes = require('./route/adminRoutes');
const contactMeMessageRoutes = require('./route/contactMeMessageRoute');
const transactionRoute = require('./route/transactionRoutes');
const atmRouter = require('./route/atmRoutes');
const alertRoutes = require('./route/alertRoutes');
const notificationRoutes = require('./route/notificationRoutes');

const app = express();


app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); // Use express' built-in URL-encoded parser
app.use(cors());


app.use('/api', customerRoutes);
app.use('/api', adminRoutes);
app.use('/api', supportingDocumentRoutes);
// Use bankAccount routes
app.use('/api', bankAccountRoutes);

app.use('/api',alertRoutes);
//Use BankCard Routes
app.use('/api', bankCardRoutes);

//alert pin stats route
app.use('/api', alertPinLogRoutes);
app.use('/api', contactMeMessageRoutes);
app.use('/api', transactionRoute);

//atm route
app.use('/api', atmRouter);
//notification
app.use('/api',notificationRoutes);






app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
