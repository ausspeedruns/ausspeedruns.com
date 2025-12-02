import type { CollectionConfig } from 'payload';

export const Incentives: CollectionConfig = {
  slug: 'incentives',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'run',
      type: 'relationship',
      relationTo: 'runs',
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'data',
      type: 'json',
    },
  ],
};

export interface Goal {
  goal: number;
  current: number;
}

export interface War {
  options: {
    name: string;
    total: number;
  }[];
}
