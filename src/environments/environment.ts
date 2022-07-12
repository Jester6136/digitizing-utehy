// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
// export const environment = EnvironmentConstants.get('ENVIRONMENT');
export const environment = {
    production: false,
    IMAGE_API: 'http://localhost:8888',
    // BASE_API: 'http://localhost:6868',
    BASE_API: 'http://117.4.121.197:6786',
};
