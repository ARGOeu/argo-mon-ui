export type FeedTextPart = string | { text: string; href: string }

export type TopologyFeedTypeInfo = {
  kind: 'generic' | 'specific'
  logo?: string
  description: FeedTextPart[][]
  bestFor?: FeedTextPart[]
}

export const TOPOLOGY_FEED_TYPE_INFO: Record<string, TopologyFeedTypeInfo> = {
  internal: {
    kind: 'generic',
    logo: '/ARGO_LOGO_COLOR_ENG_TITLE.png',
    description: [
      [
        'Define your topology by hand, right here. Use a simple, friendly form to add your services, organize them into groups and add your contacts.',
      ],
    ],
    bestFor: [
      'Getting started from scratch, or when your service information isn’t stored anywhere else.',
    ],
  },
  external: {
    kind: 'generic',
    logo: '/ARGO_LOGO_COLOR_ENG_TITLE.png',
    description: [
      [
        'Other external topology feeds. Used after discussions with the tenant admin.',
      ],
    ],
  },
  CSV: {
    kind: 'generic',
    logo: '/ARGO_LOGO_COLOR_ENG_TITLE.png',
    description: [
      [
        'Create your topology from a CSV file hosted online. After selecting this option, you’ll be asked for the file’s web address (URL). The monitoring service reads the file and builds your topology from it.',
      ],
    ],
    bestFor: [
      'Teams that already keep their services in a spreadsheet and want to import them in one go. Not sure how the file should look? See the ',
      {
        text: 'example topology file',
        href: 'https://docs.google.com/spreadsheets/d/1dJf535KY2QN0T6ZbR3b1rlvCIil1DSR5T0_NSLa7CQw',
      },
      '.',
    ],
  },
  'desy-marketplace': {
    kind: 'specific',
    logo: '/topology-feed/desy-marketplace.png',
    description: [
      [
        'The ',
        { text: 'DESY Marketplace', href: 'https://nfdi-pilot.desy.de/' },
        ' exposes service information in a predefined format, making it easier to integrate with external monitoring systems.',
      ],
      [
        'If you use the same software or a similar catalogue solution, please let us know and provide the relevant connector or API endpoint. This would allow us to easily retrieve the required information and start monitoring your services.',
      ],
    ],
    bestFor: [
      'Teams using the DESY Marketplace software or another compatible service catalogue that exposes information in a standardised format.',
    ],
  },
  'node-registry': {
    kind: 'specific',
    logo: '/topology-feed/eosc-beyond.png',
    description: [
      [
        'This connector was developed to retrieve information about the services provided by the EOSC-Beyond Nodes.',
      ],
      [
        'The Node Registry is a service offered within the EOSC-Beyond project and used by the pilot Nodes to publish and expose their service information in a predefined format.',
      ],
    ],
    bestFor: ['The EOSC-Beyond environment and the Node Registry.'],
  },
  'eosc-service-catalog': {
    kind: 'specific',
    logo: '/topology-feed/eosc-beyond.png',
    description: [
      [
        'This connector was developed to retrieve service information from Nodes that support the ',
        {
          text: 'EOSC-Beyond Resource Catalogue specification',
          href: 'https://providers.sandbox.eosc-beyond.eu/api/api-docs/resource-catalogue',
        },
        ', making it available for monitoring purposes.',
      ],
    ],
    bestFor: ['The EOSC-Beyond environment and the Node Registry.'],
  },
}
