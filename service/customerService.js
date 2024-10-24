const bcrypt = require('bcryptjs');
const CustomerDAO = require('../DAO/customerDAO');
const BankAccountDAO = require('../DAO/bankAccountDAO');
const EmailService = require('./emailService');
const crypto = require('crypto');

const otpMap = new Map();
const tempCustomerData = new Map();

const SALT_ROUNDS = 10; 

const CustomerService = {
    createCustomer: (customerData, callback) => {
        if (typeof callback !== 'function') {
            throw new Error('Callback is not provided or not a function');
        }
        console.log('Creating customer with data:', customerData);

       
        bcrypt.hash(customerData.loginPin, SALT_ROUNDS, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                return callback({ status: 500, message: 'Error hashing password' });
            }

           
            customerData.loginPin = hashedPassword;

          
            tempCustomerData.set(customerData.CustID_Nr, customerData);

            console.log('Temporary customer data after creation:', tempCustomerData);
            callback(null, { message: 'Customer data stored. Proceed to the next step.' });
        });
    },


    getbyAccountNumber: (accountNum, callback) => {
        if (!accountNum) return callback(new Error('Account Number is required'));
     CustomerDAO.getbyAccountNumber(accountNum, callback);
        
    },
    getbyAccountID: (accountID, callback) =>{
        if(!accountID) return callback(new Error('Account ID ir required'));
        CustomerDAO.getCustomerByAccID(accountID,callback);
    },

    getCustomerById: (custID_Nr, callback) => {
        if (!custID_Nr) return callback(new Error('Customer ID is required'));

        CustomerDAO.getById(custID_Nr, callback);
    },

    updateCustomer: (custID_Nr, updateData, callback) => {
        if (!custID_Nr || !updateData) return callback(new Error('Customer ID and update data are required'));

        CustomerDAO.getById(custID_Nr, (err, existingCustomer) => {
            if (err) return callback(err);
            if (!existingCustomer || existingCustomer.length === 0) {
                return callback(new Error('Customer not found'));
            }

            CustomerDAO.update(custID_Nr, updateData, callback);
        });
    },
    // Method to verify the old PIN (loginPin or alertPin)
verifyPin: (custID_Nr, oldPin, pinKey, callback) => {
    console.log(`Verifying PIN for customer ID: ${custID_Nr}, PIN type: ${pinKey}`);
 
    CustomerDAO.getById(custID_Nr, (err, customer) => {
        if (err) {
            console.error('Database error:', err); // Log database error
            return callback({ status: 500, message: 'Database error' });
        }
        if (!customer) {
            console.error('Customer not found:', custID_Nr); // Log if customer is not found
            return callback({ status: 404, message: 'Customer not found' });
        }
 
        // Map pinKey to match the database field names (capitalize first letter)
        const pinField = pinKey === 'loginPin' ? 'LoginPin' : 'AlertPin';
 
        // Compare provided old PIN with the stored hashed PIN
        const hashedPin = customer[pinField];
        if (!hashedPin) {
            console.error(`No hashed PIN found for customer ${custID_Nr} and pinKey: ${pinField}`); // Log missing hashed PIN
            return callback({ status: 400, message: `No ${pinField} found for this customer` });
        }
 
        // Log the hashed PIN for debugging purposes
        console.log(`Retrieved hashed PIN for customer ${custID_Nr}:`, hashedPin);
 
        // Compare provided old PIN with the corresponding hashed PIN (loginPin or alertPin)
        bcrypt.compare(oldPin, hashedPin, (err, isMatch) => {
            if (err) {
                console.error('Error verifying PIN:', err); // Log bcrypt error
                return callback({ status: 500, message: 'Error verifying PIN' });
            }
 
            if (isMatch) {
                console.log('Old PIN verified successfully for customer:', custID_Nr); // Log success
                return callback(null, { success: true, message: 'Old PIN verified' });
            } else {
                console.log('Old PIN is incorrect for customer:', custID_Nr); // Log incorrect PIN
                return callback({ status: 400, message: 'Old PIN is incorrect' });
            }
        });
    });
},
 
// Updated Update Customers with Old PIN Verification
updateCustomerDetailsService : (custID_Nr, updateData, oldPin, pinKey, callback) => {
    console.log('Verifying old PIN for customer:', custID_Nr);
 
    // First, verify the old PIN before proceeding with the update
    CustomerService.verifyPin(custID_Nr, oldPin, pinKey, (err, verificationResult) => {
        if (err || !verificationResult.success) {
            console.error('Old PIN verification failed:', err || verificationResult.message);
            return callback(err || { status: 400, message: 'Old PIN verification failed' });
        }
 
        // Proceed to hash and update the new PIN(s)
        const promises = [];
 
        // Check if LoginPin needs to be updated and hash it
        if (updateData.loginPin) {
            const loginPinPromise = new Promise((resolve, reject) => {
                bcrypt.hash(updateData.loginPin, SALT_ROUNDS, (err, hashedLoginPin) => {
                    if (err) {
                        console.error('Error hashing LoginPin:', err); // Log bcrypt hash error
                        return reject(err);
                    }
                    updateData.loginPin = hashedLoginPin; // Replace the plain text PIN with the hashed one
                    resolve();
                });
            });
            promises.push(loginPinPromise);
        }
 
        // Check if AlertPin needs to be updated and hash it
        if (updateData.alertPin) {
            const alertPinPromise = new Promise((resolve, reject) => {
                bcrypt.hash(updateData.alertPin, SALT_ROUNDS, (err, hashedAlertPin) => {
                    if (err) {
                        console.error('Error hashing AlertPin:', err); // Log bcrypt hash error
                        return reject(err);
                    }
                    updateData.alertPin = hashedAlertPin; // Replace the plain text PIN with the hashed one
                    resolve();
                });
            });
            promises.push(alertPinPromise);
        }
 
        // Wait for all PIN updates to complete before updating the customer details
        Promise.all(promises)
            .then(() => {
                CustomerDAO.update(custID_Nr, updateData, (err, result) => {
                    if (err) {
                        console.error('Error updating customer:', err); // Log database update error
                        return callback(err);
                    }
                    if (result.affectedRows === 0) {
                        console.error('Customer not found or no changes made:', custID_Nr); // Log if no changes were made
                        return callback(new Error('Customer not found or no changes made'));
                    }
                    callback(null, { success: true, message: 'Customer details updated successfully' });
                });
            })
            .catch(err => {
                console.error('Error hashing PIN(s):', err); // Log error for hashing failure
                return callback({ status: 500, message: 'Error hashing PIN(s)' });
            });
    });
},
//end of updaATE

    deleteCustomer: (custID_Nr, callback) => {
        if (!custID_Nr) return callback(new Error('Customer ID is required'));

        CustomerDAO.getById(custID_Nr, (err, existingCustomer) => {
            if (err) return callback(err);
            if (!existingCustomer || existingCustomer.length === 0) {
                return callback(new Error('Customer not found'));
            }

            CustomerDAO.delete(custID_Nr, callback);
        });
    },

    updateCustomerStep: (custID_Nr, stepData, callback) => {
        if (typeof callback !== 'function') {
            throw new Error('Callback is not provided or not a function');
        }

        const existingData = tempCustomerData.get(custID_Nr);

        if (!existingData) {
            return callback({ status: 404, message: 'Customer ID not found' });
        }

        const updatedData = { ...existingData, ...stepData };
        tempCustomerData.set(custID_Nr, updatedData);

        if (stepData.Email) {
            const otp = crypto.randomInt(100000, 999999).toString();
            otpMap.set(stepData.Email, otp);
            EmailService.sendOtpEmail(stepData.Email, otp)
                .then(() => callback(null, { message: 'OTP sent. Verify it.' }))
                .catch(emailErr => callback({ status: 500, message: 'Failed to send OTP: ' + emailErr.message }));
        } else {
            callback(null, { message: 'Customer data updated successfully.' });
        }
    },

    verifyOtp: (Email, otp, callback) => {
        if (typeof callback !== 'function') {
            throw new Error('Callback is not provided or not a function');
        }

        try {
            const storedOtp = otpMap.get(Email);
            if (storedOtp !== otp) {
                return callback({ status: 400, message: 'Invalid OTP' });
            }

            const customerData = Array.from(tempCustomerData.values()).find(data => data.Email === Email);
            if (!customerData) {
                return callback({ status: 404, message: 'Customer data not found for email.' });
            }

          
            CustomerDAO.create(customerData, (err, customerResult) => {
                if (err) {
                    if (err.status === 400) {
                        return callback({ status: 400, message: 'Email already exists' });
                    } else {
                        console.error('Failed to create customer:', err);
                        return callback({ status: 500, message: 'Database error' });
                    }
                }

                const customerID = customerData.CustID_Nr;
                console.log('Customer created with ID:', customerID);

                const newBankAccount = {
                    AccountNr: generateRandomAccountNumber(),
                    AccountType: 'Savings',
                    Balance: 0,
                    CreationDate: new Date(),
                    isActive: 1
                };

                BankAccountDAO.create(newBankAccount, (accountErr, bankAccountResult) => {
                    if (accountErr) {
                        console.error('Error creating bank account:', accountErr);
                        return callback({ status: 500, message: 'Failed to create bank account' });
                    }

                    const bankAccountID = bankAccountResult.id;
                    console.log('Bank Account created with ID:', bankAccountID); 

                    
                    CustomerDAO.updateFields(customerID, { AccountID: bankAccountID }, (updateErr, updateResult) => {
                        if (updateErr) {
                            console.error('Error updating customer with AccountID:', updateErr);
                            return callback({ status: 500, message: 'Failed to update customer with AccountID' });
                        }

                        otpMap.delete(Email);
                        tempCustomerData.delete(customerData.CustID_Nr);

                        console.log('Customer and bank account successfully created:', customerData.CustID_Nr);
                        callback(null, { message: 'OTP verified, customer and bank account created.' });
                    });
                });
            });
        } catch (error) {
            console.error('Unexpected error during OTP verification:', error);
            callback({ status: 500, message: 'Unexpected server error' });
        }
    }
};

function generateRandomAccountNumber() {
    return Date.now().toString();
}

module.exports = CustomerService;
