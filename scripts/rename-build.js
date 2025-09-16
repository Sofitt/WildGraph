import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

// Получаем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Путь к папке dist
const distPath = path.join(__dirname, '../dist')
const oldFilePath = path.join(distPath, 'index.html')
const newFilePath = path.join(distPath, 'Люминарий.html')

// Проверяем, существует ли файл index.html
if (fs.existsSync(oldFilePath)) {
  // Переименовываем файл
  fs.renameSync(oldFilePath, newFilePath)
  console.log('✅ Файл успешно переименован в "Люминарий.html"')
} else {
  console.log('❌ Файл index.html не найден в папке dist')
}
