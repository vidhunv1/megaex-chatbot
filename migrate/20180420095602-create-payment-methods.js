'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('PaymentMethods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      paymentId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'PaymentDetails', key: 'id' }
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      field1: {
        allowNull: false,
        type: Sequelize.STRING
      },
      field2: {
        allowNull: true,
        type: Sequelize.STRING
      },
      field3: {
        allowNull: true,
        type: Sequelize.STRING
      },
      field4: {
        allowNull: true,
        type: Sequelize.STRING
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
    return queryInterface.dropTable('PaymentMethods');
  }
};
