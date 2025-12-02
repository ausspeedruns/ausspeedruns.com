import type { CollectionConfig } from 'payload';

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  admin: {
    useAsTitle: 'game',
  },
  fields: [
    {
      name: 'runner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'game',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'text',
      required: true,
    },
    {
      name: 'platform',
      type: 'text',
      required: true,
    },
    {
      name: 'techPlatform',
      type: 'text',
    },
    {
      name: 'estimate',
      type: 'text',
      required: true,
    },
    {
      name: 'possibleEstimate',
      type: 'text',
    },
    {
      name: 'possibleEstimateReason',
      type: 'text',
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
    },
    {
      name: 'specialRequirements',
      type: 'textarea',
    },
    {
      name: 'raceType',
      type: 'select',
      options: [
        {
          label: 'No Race',
          value: 'noRace',
        },
        {
          label: 'Possible Solo',
          value: 'solo',
        },
        {
          label: 'Only Race/Coop',
          value: 'only',
        },
      ],
      defaultValue: 'noRace',
    },
    {
      name: 'racer',
      type: 'text',
    },
    {
      name: 'isCoop',
      type: 'checkbox',
    },
    {
      name: 'video',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Accepted',
          value: 'accepted',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
        {
          label: 'Backup',
          value: 'backup',
        },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'canBackup',
      type: 'checkbox',
    },
  ],
};
