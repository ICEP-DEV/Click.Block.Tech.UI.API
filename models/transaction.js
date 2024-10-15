class Transaction {
    constructor(transactionID, accountID, transactionType, transactionDate, transactionAmount, status, isPanicTriggered, locationID) {
      this.transactionID = transactionID;
      this.accountID = accountID;
      this.transactionType = transactionType;
      this.transactionDate = transactionDate;
      this.transactionAmount = transactionAmount;
      this.status = status;
      this.isPanicTriggered = isPanicTriggered;
      this.locationID = locationID;
    }
  }
  
  module.exports = Transaction;
  