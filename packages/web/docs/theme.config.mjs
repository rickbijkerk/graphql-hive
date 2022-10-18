import { Giscus, useTheme } from '@theguild/components';
import { useRouter } from 'next/router';
import { VscTerminal } from 'react-icons/vsc';

// eslint-disable-next-line no-process-env, no-undef
const projectLink = process.env.NEXT_PUBLIC_APP_LINK;

export default {
  titleSuffix: ' – Documentation - GraphQL Hive',
  projectLink: projectLink,
  projectLinkIcon: <VscTerminal />,
  github: null,
  docsRepositoryBase: null,
  nextLinks: true,
  prevLinks: true,
  search: true,
  unstable_flexsearch: true,
  floatTOC: true,
  customSearch: null,
  darkMode: true,
  footer: false,
  logo: (
    <>
      <strong>GraphQL Hive</strong>
      <span
        style={{
          marginLeft: '1rem',
        }}
      >
        Documentation
      </span>
    </>
  ),
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="GraphQL Hive: documentation" />
      <meta name="og:title" content="GraphQL Hive: documentation" />
    </>
  ),
  main: {
    extraContent() {
      const { resolvedTheme } = useTheme();
      const { route } = useRouter();

      if (route === '/') {
        return null;
      }
      return (
        <Giscus
          // ensure giscus is reloaded when client side route is changed
          key={route}
          repo="kamilkisiela/graphql-hive"
          repoId="R_kgDOHWr5kA"
          category="Docs Discussions"
          categoryId="DIC_kwDOHWr5kM4CSDSS"
          mapping="pathname"
          theme={resolvedTheme}
        />
      );
    },
  },
};
