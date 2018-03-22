'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      transactionId: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      transactionType: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      amount: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      confirmations: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      receivedTime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      transactionSource: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      currencyCode: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Transactions');
  }
};
