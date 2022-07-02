import { Sequelize } from 'sequelize-typescript';

import { databaseConfig } from '../config';
import { Chat } from './Chat';
import { User } from './User';

if (!databaseConfig.database || !databaseConfig.username || !databaseConfig.password) {
    throw new Error('Database credentials are not set');
}

export const db = new Sequelize(databaseConfig.database, databaseConfig.username, databaseConfig.password, {
    models: [User, Chat],
    dialect: databaseConfig.dialect,
    host: databaseConfig.host,
});

db.sync();