import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export { schema };

// Bağlantı fonksiyonu
export function createDbConnection(connectionString: string) {
  // Uygulama seviyesinde query client oluşturulur
  const queryClient = postgres(connectionString);
  return drizzle(queryClient, { schema });
}
