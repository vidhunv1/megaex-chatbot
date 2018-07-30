'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Orders', {
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
      type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING
      },
      price: {
        allowNull: true,
        type: Sequelize.FLOAT
      },
      minAmount: {
        allowNull: true,
        type: Sequelize.FLOAT
      },
      maxAmount: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      matchedOrderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Orders', key: 'id' }
      },
      currencyCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      marginPercentage: {
        type: Sequelize.FLOAT,
        default: 0.0,
        allowNull: true
      },
      paymentMethodFilters: {
        allowNull: true,
        type: Sequelize.STRING
      },
      accountVerifiedFilter: {
        allowNull: true,
        type: Sequelize.BOOLEAN
      },
      confirmedTime: {
        allowNull: true,
        type: Sequelize.DATE
      },
      cancelCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        default: 0,
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
    return queryInterface.dropTable('Orders');
  }
}
