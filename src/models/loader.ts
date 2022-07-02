import { Sequelize } from 'sequelize-typescript';
import { databaseConfig } from '../config';
import { Chat } from './Chat';
import { User } from './User';

export let db: Sequelize;

/**
 * Function for connecting the database for the project
 */
export function connectToDatabase(config = databaseConfig) {
  if (!config.database || !config.username || !config.password) {
    throw new Error('Database credentials are not set');
  }

  db = new Sequelize(config.database, config.username, config.password, {
    models: [User, Chat],
    dialect: config.dialect,
    host: config.host,
  });

  db.sync();
}
