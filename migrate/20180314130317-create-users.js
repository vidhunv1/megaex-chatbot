'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      locale: {
        allowNull: false,
        default: 'en',
        type: Sequelize.STRING(10)
      },
      accountId: {
        unique: true,
        type: Sequelize.STRING
      },
      messageCount: {
        type: Sequelize.INTEGER,
        field: 'messageCount',
        allowNull: false,
        defaultValue: 0,
      },
      isTermsAccepted: {
        type: Sequelize.BOOLEAN,
        field: 'isTermsAccepted',
        allowNull: false,
        defaultValue: false,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        field: 'isVerified',
        allowNull: false,
        defaultValue: false,
      },
      exchangeRateSource: {
        type: Sequelize.STRING,
        field: 'exchangeRateSource',
        allowNull: false,
        defaultValue: 'localrate',
      },
      currencyCode: {
        type: Sequelize.STRING,
        field: 'currencyCode',
        allowNull: true,
      },
      blockedUsers: {
        type: Sequelize.STRING,
        field: 'blockedUsers',
        defaultValue: '[]',
        allowNull: false,      
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
    return queryInterface.dropTable('Users');
  }
}