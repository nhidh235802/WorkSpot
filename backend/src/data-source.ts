import 'dotenv/config';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

function buildOptions(): DataSourceOptions {
  const entities = ['src/**/*.entity{.ts,.js}'];
  const migrations = ['src/migrations/*{.ts,.js}'];

  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities,
      migrations,
      synchronize: false,
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_DATABASE || 'workspot_db',
    entities,
    migrations,
    synchronize: false,
  };
}

export const AppDataSource = new DataSource(buildOptions());

