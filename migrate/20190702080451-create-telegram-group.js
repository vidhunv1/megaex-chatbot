'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('TelegramGroups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      telegramGroupId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      telegramId: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      messageCount: {
        allowNull: false,
        type: Sequelize.INTEGER,
        default: 0
      },
      dailyAlertLimit: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    return queryInterface.dropTable('TelegramGroups');
  }
};
