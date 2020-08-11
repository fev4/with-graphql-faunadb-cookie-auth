# Next.js, FaunaDB and `httpOnly` Cookie Auth Flow with GraphQL

The following guide explains how to setup FaunaDB & Next.js in order to have a simple `httpOnly` cookie auth flow, using Apollo Server and react-query/graphql-request on the client, while being deployed in Vercel (a serverless environment).

These are some of the features that this setup provides:

- An [httpOnly cookie based](https://with-graphql-faunadb-cookie-auth.now.sh) auth flow.
- Token validation on refresh and window focus with [`react-query`](https://github.com/tannerlinsley/react-query#useQuery).
- A local GraphQL server as a proxy, allowing us to extend Fauna's GraphQL endpoint.

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
