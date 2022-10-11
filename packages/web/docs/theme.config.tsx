/* eslint sort-keys: error */
import { defineConfig, HiveLogo } from '@theguild/components';

const SITE_NAME = 'GraphQL Hive';

export default defineConfig({
  docsRepositoryBase: 'https://github.com/kamilkisiela/graphql-hive/tree/main/packages/web/docs',
  logo: (
    <>
      <HiveLogo className='mr-1.5 h-9 w-9' />
      <div>
        <h1 className='md:text-md text-sm font-medium'>{SITE_NAME}</h1>
        <h2 className='hidden text-xs sm:block'>Documentation</h2>
      </div>
    </>
  ),
  head: (
    <>
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <meta name='description' content={`${SITE_NAME}: documentation`} />
      <meta name='og:title' content={`${SITE_NAME}: documentation`} />
    </>
  ),
  titleSuffix: ` – ${SITE_NAME}`,
});
