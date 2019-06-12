'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Trades', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sellerUserId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      buyerUserId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      createdByUserId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      orderId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Orders', key: 'id' }
      },
      blockedTransactionId: {
        allowNull: true,
        type: Sequelize.BIGINT,
        references: { model: 'Transactions', key: 'id' }
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING
      },
      orderType: {
        allowNull: false,
        type: Sequelize.STRING
      },
      terms: {
        allowNull: true,
        type: Sequelize.STRING
      },
      cryptoCurrencyCode: {
        allowNull: false,
        type: Sequelize.STRING
      },
      fiatCurrencyCode: {
        allowNull: false,
        type: Sequelize.STRING
      },
      cryptoAmount: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      fiatAmount: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      fixedRate: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      paymentMethodType: {
        allowNull: false,
        type: Sequelize.STRING
      },
      paymentMethodId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'PaymentMethods', key: 'id' }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Trades');
  }
};