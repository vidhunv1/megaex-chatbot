'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Wallets', {
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
      availableBalance: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.FLOAT
      },
      unconfirmedBalance: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.FLOAT
      },
      blockedBalance: {
        allowNull: false,
        defaultValue: 0.0,
        type: Sequelize.FLOAT
      },
      currencyCode: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      address: {
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
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Wallets');
  }
};
