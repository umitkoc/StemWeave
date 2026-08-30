import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Bu dosya Adım 2 taslağı olarak oluşturulmuştur.
// Gerçek domain tabloları (User, Project vb.) sonraki adımlarda eklenecektir.

export const testTable = pgTable('test_table', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
