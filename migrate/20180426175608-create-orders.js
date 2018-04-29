import { DataType } from "sequelize-typescript";

'use strict';

export function up(queryInterface, Sequelize) {
  return queryInterface.createTable('Orders', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataType.INTEGER
    },
    userId: {
      type: DataType.BIGINT,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    type: {
      allowNull: false,
      type: DataType.STRING
    },
    status: {
      allowNull: false,
      type: DataType.STRING
    },
    minAmount: {
      allowNull: false,
      type: DataType.FLOAT
    },
    maxAmount: {
      allowNull: true,
      type: DataType.FLOAT
    },
    matchedOrderId: {
      type: DataType.INTEGER,
      allowNull: true,
      references: { model: 'Orders', key: 'id' }
    },
    paymentMethodFilters: {
      allowNull: true,
      type: DataType.STRING
    },
    accountVerifiedFilter: {
      allowNull: true,
      type: DataType.BOOLEAN
    },
    confirmedTime: {
      allowNull: true,
      type: DataType.DATE
    },
    cancelCount: {
      type: DataType.INTEGER,
      allowNull: false,
      default: 0,
    },
    createdAt: {
      allowNull: false,
      type: DataType.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataType.DATE
    }
  });
}
export function down(queryInterface, Sequelize) {
  return queryInterface.dropTable('Orders');
}
