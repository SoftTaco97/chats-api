import { Sequelize } from 'sequelize-typescript';
import { Chat } from './Chat';
import { connectToDatabase } from './loader';
import { User } from './User';

jest.mock('sequelize-typescript', () => ({
  ...jest.requireActual('sequelize-typescript'),
  Sequelize: jest.fn(),
}));

describe('src/models/loader.ts', () => {
  describe('connectToDatabase', () => {
    it('Should throw an error if the database configuration is not set', () => {
      expect(() => connectToDatabase({} as any)).toThrow(new Error('Database credentials are not set'));
    });

    it('Should create the database connection and sync the tables', () => {
      const mockDb = {
        sync: jest.fn(),
      };
      const mockConfig = {
        database: 'test',
        username: 'user',
        password: 'password',
        dialect: 'test',
        host: 'host'
      };

      (Sequelize as unknown as jest.Mock).mockReturnValue(mockDb);

      connectToDatabase(mockConfig as any);

      expect(Sequelize).toHaveBeenCalledWith(mockConfig.database, mockConfig.username, mockConfig.password, {
        models: [User, Chat],
        dialect: mockConfig.dialect,
        host: mockConfig.host
      });
      expect(mockDb.sync).toHaveBeenCalled();
    });
  });
});
