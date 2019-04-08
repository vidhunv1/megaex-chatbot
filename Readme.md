# ! commands

## Reset DB
    `sequelize db:migrate:undo:all`
    `sequelize db:migrate`

## Reset Cache from all databases
    `redis-cli FLUSHALL`

## Reset Cache from specific database
    `redis-cli -n <database_number> FLUSHDB`

This app uses bull for message queue
[bull-arena](https://github.com/bee-queue/arena) gives a neat UI for visualization.


