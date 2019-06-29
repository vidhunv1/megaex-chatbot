'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'UserInfos',
        'passportData',
        {
          type: Sequelize.TEXT
        }
      ),
    ]);
  },

  down: (queryInterface, _Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('UserInfos', 'passportData'),
    ]);
  }
};
