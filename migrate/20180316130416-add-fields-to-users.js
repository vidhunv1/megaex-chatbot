'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'messageCount', {
      type: Sequelize.INTEGER,
      field: 'messageCount',
      allowNull: false,
      defaultValue: 0,
    })
    await queryInterface.addColumn('Users', 'isTermsAccepted', {
      type: Sequelize.BOOLEAN,
      field: 'isTermsAccepted',
      allowNull: false,
      defaultValue: false,
    })
    await queryInterface.addColumn('Users', 'isVerified', {
      type: Sequelize.BOOLEAN,
      field: 'isVerified',
      allowNull: false,
      defaultValue: false,
    })
    return await queryInterface.addColumn('Users', 'currencyCode', {
      type: Sequelize.STRING,
      field: 'currencyCode',
      defaultValue: 'usd',
      allowNull: false,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'messageCount')
    await queryInterface.removeColumn('Users', 'isTermsAccepted')
    await queryInterface.removeColumn('Users', 'isVerified')
    return await queryInterface.removeColumn('Users', 'currencyCode')
  }
};