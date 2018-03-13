'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn('Users', 'messageCount', {
        type: Sequelize.INTEGER,
        field: 'messageCount',
        allowNull: false,
        defaultValue: 0,
      })
      .then(a => {
        return queryInterface.addColumn('Users', 'isTermsAccepted', {
          type: Sequelize.BOOLEAN,
          field: 'isTermsAccepted',
          allowNull: false,
          defaultValue: false,
        })
        .then(a => {
          return queryInterface.addColumn('Users', 'isVerified', {
            type: Sequelize.BOOLEAN,
            field: 'isVerified',
            allowNull: false,
            defaultValue: false,
          })          
        })
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'messageCount')
      .then(a => {
        return queryInterface.removeColumn('Users', 'isTermsAccepted')
          .then(a => {
            return queryInterface.removeColumn('Users', 'isVerified') 
          })
      });
  }
};
