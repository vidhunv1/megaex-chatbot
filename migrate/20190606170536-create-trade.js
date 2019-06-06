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
      openedByUserId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      orderId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Orders', key: 'id' }
      },
      amount: {
        allowNull: false,
        type: Sequelize.NUMBER
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING
      },
      blockedTransactionId: {
        allowNull: true,
        type: Sequelize.BIGINT,
        references: { model: 'Transactions', key: 'id' }
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