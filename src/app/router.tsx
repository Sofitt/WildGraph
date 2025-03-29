import Support from '@/pages/Support.tsx'
import { useRoutes } from 'react-router'
import App from '@/pages/App.tsx'
import { Editor } from '@/pages/user/Editor.tsx'

export const Router = () => {
  const routes = [
    { path: '/', element: <App /> },
    { path: '/support', element: <Support /> },
    { path: '/user/editor', element: <Editor /> },
  ]

  return useRoutes(routes)
}
