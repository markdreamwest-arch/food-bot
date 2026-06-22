export function validatePhoto(file: any): { valid: boolean; error?: string } {
  const MAX_SIZE = 20 * 1024 * 1024; // 20 MB (увеличил лимит)
  
  // Разрешаем ВСЕ форматы изображений
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/tiff',
    'image/bmp',
    'image/svg+xml',
    'image/heic',
    'image/heif',
    'image/avif',
    'image/x-ms-bmp',
    'image/vnd.wap.wbmp'
  ];

  if (!file) {
    return { valid: false, error: '❌ Файл не найден' };
  }

  if (file.file_size > MAX_SIZE) {
    return { 
      valid: false, 
      error: `❌ Файл слишком большой. Максимум ${MAX_SIZE / 1024 / 1024}MB` 
    };
  }

  // Проверяем, что это изображение (по mime-type)
  const isImage = file.mime_type && file.mime_type.startsWith('image/');
  if (!isImage) {
    return { 
      valid: false, 
      error: '❌ Пожалуйста, отправьте изображение' 
    };
  }

  return { valid: true };
}