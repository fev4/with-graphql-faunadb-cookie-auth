# Next.js, FaunaDB and `httpOnly` Cookie Auth Flow with GraphQL

The present example explains how to setup an `httpOnly` cookie auth flow with Next.js and Fauna, using Apollo Server and react-query/graphql-request on the client.

These are some of the features that this setup provides:

1. The auth flow lives inside the Fauna dashboard with the help of [User Defined Functions (UDFs)](https://docs.fauna.com/fauna/current/api/graphql/functions) and [User Defined Roles (UDRs)](https://docs.fauna.com/fauna/current/security/roles.html). UDFs and UDRs are one flexible medium offered in Fauna by which you can implement business logic and [Attribute-based Access Control (ABAC)](https://docs.fauna.com/fauna/current/security/abac.html) to any document, function and index in the database.
2. A GraphQL server using [schema stitching](https://www.apollographql.com/docs/apollo-server/features/schema-stitching/).
   1. This is helpful because it provides the maximum possible flexibility in terms of API integration through GraphQL, given that Fauna doesn't support [Apollo Federation](https://www.apollographql.com/docs/apollo-server/federation/introduction/) yet.
   2. In other words, by using schema stitching we can extend our GraphQL endpoint to connect with other APIs or basically run any arbitrary code in-between Fauna requests (similar to a proxy).
   3. This is specially useful if you don't want to have several API endpoints and want to manage everything through GraphQL.
3. The example also provides a [series of scripts](/examples/with-cookie-auth-fauna-apollo-server/scripts) that can be executed with a single command, that help you manage your database quickly on a day to day basis, from pushing a newly created schema, generating new keys, updating your functions or even creating a whole new database from scratch. This is incredibly useful when getting started in order to fasten things up.
4. An httpOnly cookie based auth flow.
5. Token validation on refresh and window focus with [`react-query`](https://github.com/tannerlinsley/react-query#useQuery). This is useful because it keeps the auth state changes in sync with the client, for example if the user token dissapears on the DB (for any reason), it logs out the user in any other client automatically.

This is an advanced example that assumes a lot of concepts, and it strives to provide the most ample bed from which you can get started with both FaunaDB and Next.js. If you are looking for a simpler approach which doesn't include GraphQL, UDFs or User Defined Roles, and only handles a cookie based authentication plus token validation, be sure to check out the example [with-cookie-auth-fauna](https://github.com/vercel/next.js/tree/canary/examples/with-cookie-auth-fauna).

## Demo

[https://with-graphql-faunadb-cookie-auth.now.sh/](https://with-graphql-faunadb-cookie-auth.now.sh/)

## How to use

### Using `create-next-app`

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init) or [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/) to bootstrap the example:

```bash
npx create-next-app --example with-cookie-auth-fauna-apollo-server with-cookie-auth-fauna-apollo-server-app
# or
yarn create next-app --example with-cookie-auth-fauna-apollo-server with-cookie-auth-fauna-apollo-server-app
```

### Download manually

Download the example:

```bash
curl https://codeload.github.com/vercel/next.js/tar.gz/canary | tar -xz --strip=2 next.js-canary/examples/with-cookie-auth-fauna-apollo-server
cd with-cookie-auth-fauna-apollo-server
```

Install it and run:

```bash
npm install
npm run dev
# or
yarn
yarn dev
```

Deploy it to the cloud with [Vercel](https://vercel.com/import?filter=next.js&utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

### Run locally

1. Create an account on [Fauna](https://fauna.com/)
2. In the [FaunaDB Console](https://dashboard.fauna.com/), click "New Database". Name it whatever you like and click "Save".
3. Now go to "Security" and click "New Key". Let's create an "Admin" key, name it whatever you want.
4. Copy the newly created "Admin" key and create an `.env.local` file. Paste the key along the name `FAUNADB_ADMIN_SECRET`.
5. On you console, while positioned on the root folder, execute:

```
node -e 'require("./scripts/setup.js").full()'
```

This will create all the roles, functions and lastly a public key necessary to connect to the DB securely.

6. Copy the last line of the previous command into the `.env.local` file.
7. (Optional) Delete the admin key both from the [FaunaDB Console](https://dashboard.fauna.com/) and the `.env.local` file.
8. Run `yarn && yarn dev`

### Deploy on Vercel

You can deploy this app to the cloud with [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

#### Deploy Your Local Project

To deploy your local project to Vercel, push it to GitHub/GitLab/Bitbucket and [import to Vercel](https://vercel.com/import/git?utm_source=github&utm_medium=readme&utm_campaign=next-example).

**Important**: When you import your project on Vercel, make sure to click on **Environment Variables** and set them to match your `.env.local` file.
