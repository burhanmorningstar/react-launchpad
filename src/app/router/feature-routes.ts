import type {
  FeatureDefinition,
  FeatureRouteContribution,
  FeatureMenuItem,
} from '@/core/routing/types'

import type { RouteObject } from 'react-router'

export type FeatureModule = { feature: FeatureDefinition }
export type FeatureLoaders = Record<string, () => Promise<FeatureModule>>

// Descriptors are dynamic imports; they must defer page imports to route.lazy.
const discovered = import.meta.glob<FeatureModule>(
  '../../features/*/routes.tsx'
)

function routeKey(path: string) {
  return (
    ('/' + path)
      .replace(/\/+/g, '/')
      .replace(/\/$/, '')
      .toLowerCase()
      .replace(/:[^/]+/g, (parameter) =>
        parameter.endsWith('?') ? ':param?' : ':param'
      ) || '/'
  )
}

function pathsOf(
  route: RouteObject,
  parent = ''
): { path: string; id?: string }[] {
  const path = route.path?.startsWith('/')
    ? route.path
    : `${parent}/${route.path ?? ''}`
  const ownsIndex = route.children?.some((child) => child.index)
  const records =
    (route.path !== undefined && !ownsIndex) || route.index
      ? [{ path: routeKey(path), id: route.id }]
      : route.id
        ? [{ path: '', id: route.id }]
        : []
  return [
    ...records,
    ...(route.children ?? []).flatMap((child) => pathsOf(child, path)),
  ]
}

export async function loadFeatureRoutes(
  loaders: FeatureLoaders = discovered,
  {
    examplesEnabled = true,
    reservedPaths = ['/', '/*'],
  }: { examplesEnabled?: boolean; reservedPaths?: string[] } = {}
): Promise<{
  features: FeatureDefinition[]
  routes: FeatureRouteContribution[]
  menu: FeatureMenuItem[]
}> {
  const modules = await Promise.all(
    Object.entries(loaders)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(async ([file, load]) => ({ file, feature: (await load()).feature }))
  )
  const ids = new Map<string, string>()
  const paths = new Map<string, string>()
  const routeIds = new Map<string, string>()
  const reserved = new Set(reservedPaths.map(routeKey))
  const features: FeatureDefinition[] = []
  const routes: FeatureRouteContribution[] = []
  const menu: FeatureMenuItem[] = []
  for (const { file, feature } of modules) {
    if (!feature || !feature.id?.trim() || !Array.isArray(feature.routes))
      throw new Error(`Invalid feature definition in ${file}`)
    if (feature.example && !examplesEnabled) continue
    const previous = ids.get(feature.id)
    if (previous)
      throw new Error(
        `Duplicate feature id '${feature.id}': ${previous} and ${file}`
      )
    ids.set(feature.id, file)
    for (const contribution of feature.routes) {
      for (const record of pathsOf(contribution.route)) {
        if (record.id) {
          if (routeIds.has(record.id))
            throw new Error(
              `Duplicate route id '${record.id}': ${routeIds.get(record.id)} and ${file}`
            )
          routeIds.set(record.id, file)
        }
        if (!record.path) continue
        if (reserved.has(record.path))
          throw new Error(`Reserved route path '${record.path}' in ${file}`)
        if (paths.has(record.path))
          throw new Error(
            `Duplicate route path '${record.path}': ${paths.get(record.path)} and ${file}`
          )
        paths.set(record.path, file)
      }
      routes.push(contribution)
    }
    features.push(feature)
    menu.push(...(feature.menu ?? []))
  }
  return { features, routes, menu }
}
