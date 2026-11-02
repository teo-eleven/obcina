import type { RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [{ index: true, element: <HomePage /> }],
  },
]
