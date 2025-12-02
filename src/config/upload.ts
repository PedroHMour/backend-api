// Configuração placeholder para uploads futuros
export const uploadConfig = {
  // driver: 's3' | 'disk',
  directory: 'tmp',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
};