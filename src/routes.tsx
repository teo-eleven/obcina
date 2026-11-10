import type { RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { AppLoading, RouteError } from './components/RouteFallbacks'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    HydrateFallback: AppLoading,
    ErrorBoundary: RouteError,
    children: [
      { index: true, element: <HomePage /> },
      // Lazy: the shelf pulls in Firebase and zod, which the home page never needs.
      {
        path: 'categorie/:slug',
        lazy: async () => ({ Component: (await import('./pages/CategoryPage')).CategoryPage }),
      },
      {
        path: 'produs/:slug',
        lazy: async () => ({ Component: (await import('./pages/ProductPage')).ProductPage }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
