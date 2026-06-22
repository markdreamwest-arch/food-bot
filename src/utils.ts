export function validatePhoto(file: any): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

  if (!file) return { valid: false, error: 'Файл не найден' };
  if (file.file_size > MAX_SIZE) {
    return { valid: false, error: 'Файл слишком большой. Максимум 5MB' };
  }
  if (!ALLOWED_TYPES.includes(file.mime_type)) {
    return { valid: false, error: 'Поддерживаются только JPEG и PNG' };
  }
  return { valid: true };
}
