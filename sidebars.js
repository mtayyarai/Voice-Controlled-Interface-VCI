// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  specSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'philosophy',
        'when-to-use',
        'architecture',
      ],
    },
    {
      type: 'category',
      label: 'Building an App',
      collapsed: false,
      items: [
        'required-modules',
        'adapting',
        'realtime-protocol',
        'webrtc-recipe',
        'session-lifecycle',
        'ui-requirements',
        'security',
        'file-layout',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: [
        'implementation-checklist',
        'manual-test',
        'environment',
        'known-limitations',
        'extension-patterns',
      ],
    },
  ],
};

export default sidebars;
