'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Markets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fromCurrency: {
        allowNull: false,
        type: Sequelize.STRING
      },
      toCurrency: {
        allowNull: false,
        type: Sequelize.STRING
      },
      value: {
        allowNull: true,
        type: Sequelize.FLOAT
      },
      fromCurrencyUsdValue: {
        allowNull: true,
        type: Sequelize.FLOAT
      },
      toCurrencyType: { // fiat or crypto
        allowNull: false,
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
    return queryInterface.dropTable('Markets');
  }
};
