// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // Using proxy configuration - requests to /api will be proxied to http://fin.timorniss.online:5000/api
  apiUrl: '/api',
  apiImportsUrl: '/api/imports',
  ssIcon: 'assets/image/inss_logo.png',
  signatureIcon: 'assets/image/signature_icon.png',
  stampImage: 'assets/image/stamp_signature.png',
  checkBoxIcon: 'assets/image/check_box.png'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
