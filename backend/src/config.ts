export const config = {
  port: parseInt(process.env.PORT || '3000'),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://shore_app:shore_secure_pass_2026@localhost:3200/shore_db',
  jwtSecret: process.env.JWT_SECRET || 'shore_jwt_secret_key_super_secure_2026',
  minio: {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '3201'),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'shore_admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'shore_secure_minio_pass_2026',
    bucket: process.env.MINIO_BUCKET || 'shore-procedures',
  },
};
