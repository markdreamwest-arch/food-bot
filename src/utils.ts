export function validatePhoto(file: any): { valid: boolean; error?: string } {
  const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

  if (!file) {
    return { valid: false, error: '❌ Файл не найден' };
  }

  // Проверка размера (с защитой от undefined)
  if (file.file_size && file.file_size > MAX_SIZE) {
    return { 
      valid: false, 
      error: `❌ Файл слишком большой. Максимум ${MAX_SIZE / 1024 / 1024}MB` 
    };
  }

  return { valid: true };
}