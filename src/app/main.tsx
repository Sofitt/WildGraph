import { createRoot } from 'react-dom/client'
import '@/shared/assets/style/index.css'
import App from '@/App'

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
