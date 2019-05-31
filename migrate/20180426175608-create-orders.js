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
      orderType: {
        allowNull: false,
        type: Sequelize.STRING
      },

      rate: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      rateType: {
        allowNull: false,
        type: Sequelize.STRING
      },
      minFiatAmount: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      maxFiatAmount: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      cryptoCurrencyCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fiatCurrencyCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      paymentMethodType: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      paymentMethodId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'PaymentMethods', key: 'id' }
      },
      terms: {
        type: Sequelize.STRING,
        allowNull: true
      },

      isActive: {
        allowNull: false,
        type: Sequelize.BOOLEAN
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
    return queryInterface.dropTable('Orders');
  }
}
