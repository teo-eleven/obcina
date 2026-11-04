import { render, type RenderResult } from '@testing-library/react'
import { createMemoryRouter, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'

type MemoryRouter = ReturnType<typeof createMemoryRouter>

export function renderWithRouter(
  routes: RouteObject[],
  initialPath = '/',
): RenderResult & { router: MemoryRouter } {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] })
  return { router, ...render(<RouterProvider router={router} />) }
}
