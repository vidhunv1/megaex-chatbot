'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
    await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION update_balances()
      RETURNS trigger AS
      $BODY$
        DECLARE 
      	unconfirmed_balance FLOAT;
      	confirmed_balance FLOAT;
      	blocked_balance FLOAT;
      BEGIN
       SELECT SUM("Transactions"."amount") AS "unconfirmedBalance" into "confirmed_balance" from "Transactions" WHERE "currencyCode" = NEW."currencyCode" AND "userId"=NEW."userId" AND "confirmations">=1;
       SELECT SUM("Transactions"."amount") AS "unconfirmedBalance" into "unconfirmed_balance" from "Transactions" WHERE "currencyCode" = NEW."currencyCode" AND "userId"=NEW."userId" AND "confirmations"=0;
       SELECT "blockedBalance" into "blocked_balance" from "Wallets" where "userId"=NEW."userId" AND "currencyCode" = NEW."currencyCode";
         perform unconfirmed_balance, confirmed_balance from "Users";
 
       UPDATE "Wallets" SET "availableBalance" = COALESCE( ("confirmed_balance" + (-1*"blocked_balance")), 0.0), "unconfirmedBalance" = COALESCE("unconfirmed_balance",0.0) WHERE "userId"=NEW."userId" AND "currencyCode"=NEW."currencyCode";
 
       RETURN NEW;
      END;
      $BODY$

    LANGUAGE plpgsql VOLATILE
    COST 100;
    `);

    await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_wallets_balances
      AFTER UPDATE OR INSERT
      ON "Transactions"
      FOR EACH ROW
      EXECUTE PROCEDURE update_balances();
    `)
    } catch(e) {
      console.log("Error executing query: "+JSON.stringify(e));
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`DROP TRIGGER trigger_wallets_balances on "Transactions";`)
    await queryInterface.sequelize.query(`DROP FUNCTION update_balances();`)
  }
};
