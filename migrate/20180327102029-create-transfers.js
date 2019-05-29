'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Transfers', {
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
      currencyCode: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      amount: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      secretHash: {
        allowNull: true,
        type: Sequelize.STRING
      },
      receiverUserId: {
        allowNull: true,
        type: Sequelize.BIGINT,
        references: { model: 'Users', key: 'id'}
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
    return queryInterface.dropTable('Transfers');
  }
};
