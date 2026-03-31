const path = require('path');

const updatesUrl = process.env.DESKTOP_UPDATES_URL || 'https://example.com/gestion-pharmacies/updates/';

module.exports = {
  appId: 'com.gestionpharmacies.admin',
  productName: 'Gestion Pharmacies Admin',
  directories: {
    output: 'release',
  },
  files: [
    'dist/**/*',
    'electron/**/*',
    'package.json',
  ],
  extraMetadata: {
    main: 'electron/main.cjs',
  },
  publish: [
    {
      provider: 'generic',
      url: updatesUrl,
    },
  ],
  win: {
    icon: path.join(__dirname, 'build', 'icons', 'app-icon.ico'),
    signAndEditExecutable: false,
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    artifactName: 'gestion-pharmacies-admin-${version}-setup.${ext}',
  },
};
