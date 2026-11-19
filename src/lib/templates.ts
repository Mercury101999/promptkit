import { findVariables } from '@/lib/variables';
import { STARTERS } from '@/lib/starters';
import type { SavedTemplate, StarterTemplate, TemplateFilter } from '@/lib/types';

export interface TemplateListItem {
  source: 'starter' | 'saved';
  id: string;
  name: string;
  description: string;
  kind: StarterTemplate['kind'] | 'saved';
  fields: SavedTemplate['fields'];
  favorite: boolean;
  variableNames: string[];
}

function matchesQuery(item: TemplateListItem, query: string): boolean {
  if (!query) return true;
  const haystack = [item.name, item.description, item.fields.task, item.fields.role].join('\n').toLowerCase();
  return haystack.includes(query);
}

export function listTemplates(saved: SavedTemplate[], query: string, filter: TemplateFilter): TemplateListItem[] {
  const needle = query.trim().toLowerCase();
  const savedItems: TemplateListItem[] = [...saved]
    .sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    })
    .map((template) => ({
      source: 'saved' as const,
      id: template.id,
      name: template.name,
      description: template.fields.task.trim().split('\n')[0] ?? '',
      kind: 'saved' as const,
      fields: template.fields,
      favorite: template.favorite,
      variableNames: findVariables(template.fields),
    }));

  const starterItems: TemplateListItem[] = STARTERS.map((starter) => ({
    source: 'starter' as const,
    id: starter.id,
    name: starter.name,
    description: starter.description,
    kind: starter.kind,
    fields: starter.fields,
    favorite: false,
    variableNames: findVariables(starter.fields),
  }));

  const pool =
    filter === 'saved' || filter === 'favorites'
      ? savedItems
      : filter === 'starters' || filter === 'agents'
        ? starterItems
        : [...savedItems, ...starterItems];

  return pool.filter((item) => {
    if (filter === 'favorites' && !item.favorite) return false;
    if (filter === 'agents' && item.kind !== 'agent') return false;
    return matchesQuery(item, needle);
  });
}
