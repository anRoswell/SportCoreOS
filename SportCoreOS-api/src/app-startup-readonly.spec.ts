import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';

describe('App startup database safety', () => {
  it('does not execute SQL queries during startup', async () => {
    const executedQueries: string[] = [];
    const databaseMock = {
      query: jest.fn(async (sql: string) => {
        executedQueries.push(sql);
        return { rows: [], rowCount: 0 };
      }),
      getPool: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DatabaseService)
      .useValue(databaseMock)
      .compile();
    const app = moduleRef.createNestApplication();

    try {
      await app.init();

      expect(executedQueries).toEqual([]);
    } finally {
      await app.close();
    }
  });
});
