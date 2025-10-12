export const config = {
  port: Number(process.env.PORT ?? 5000),
  db: {
    dialect: 'sqlite' as const,
    storage: process.env.DB_PATH ?? './backend/database.sqlite',
    sync: { force: false },
  },
  allowDangerousFlush: process.env.ALLOW_DANGEROUS_FLUSH === 'true',
} as const;
