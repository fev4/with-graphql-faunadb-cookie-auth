# Next.js with GraphQL, FaunaDB and Cookie Auth

The following guide explains how to setup FaunaDB & Next.js in order to have a simple `httpOnly` auth flow, using Apollo Server and react-query/graphql-request on the client, while being deployed in Vercel (a serverless environment).

These are some of the features that this setup provides:

- A somewhat secure auth flow with httpOnly cookies [[1]](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Security)
- Token validation on refresh and window focus thanks to `react-query`'s [`useQuery` API](https://github.com/tannerlinsley/react-query#useQuery). In other words, if the token associated with a user identity is invalidated with [`Logout`](https://docs.fauna.com/fauna/current/api/fql/functions/logout) or in any other way, the user is also logged out in the front-end (as soon as the window is focused or refreshed).
- The local GraphQL server functions as a proxy that allows us to extend Fauna's GraphQL endpoint, and basically, let's us add local-only queries or mutations in order to extend the flexibility of remote queries or mutations, bringing great flexibility to the app. In this case, the proxy is used to create a `validCookie` query which runs before every login, signup or logout mutation to verify if the httpCookie token is valid or not, before delegating to the remote schema (the one located in Fauna's endpoint).

## Prerequisites

- Basic understanding of [GraphQL](https://www.apollographql.com/docs/apollo-server/schema/schema/).
- Basic understanding of [how to import and work with GraphQL schemas inside FaunaDB](https://docs.fauna.com/fauna/current/start/graphql).
- Basic understanding of [Vercel deployments](https://vercel.com/docs/v2/serverless-functions/introduction) and [limitations](https://vercel.com/docs/v2/platform/limits).
- Basic understanding of [Next.js API endpoints](https://nextjs.org/docs/api-routes/introduction).
- Basic understanding of [httpOnly cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).
- Medium to advanced understanding of Apollo Server (at least [how to stitch schemas and delegate them](https://www.apollographql.com/docs/apollo-server/features/schema-stitching/)).
- Medium to advanced understanding of [Fauna Query Language (FQL)](https://docs.fauna.com/fauna/current/api/fql/), [User-Defined Functions (UDFs)](https://docs.fauna.com/fauna/current/api/graphql/functions), [User-Defined Roles](https://docs.fauna.com/fauna/current/security/roles) for both Collections and Functions, and lastly, [Attribute-Based Access Control (ABAC)](https://docs.fauna.com/fauna/current/security/abac)

## Setting up FaunaDB

Let's start by defining what we need from FaunaDB. In this case we need three things: A GraphQL schema, User Defined Functions (UDFs) with FQL, and User-Defined roles. So the very first step is to have a clean db in FaunaDB to work with. Go ahead and create that first.

### The GraphQL schema

We'll be using a simple schema, take a look at it [here](/lib/graphql/faunadbSchema.gql). It defines a couple of things:

- `UserRole`: which we will use for ABAC role definitions. A basic example of how to use them at least, so you can get a sense of what these do and are capable of.
- `User`: a user type, the only custom `type` in this schema, because I want to keep things as simple as possible.
- `input`s: `CreateUserInput` & `LoginUserInput`, which will define the data needed for our mutations.
- `Mutation`s: here we define the secret sauce of this whole thing through [`@resolver` directives](https://docs.fauna.com/fauna/current/api/graphql/directives/d_resolver). In short, a `@resolver` let's us define the name of an User Defined Function (UDF) used to resolve a mutation. This is the very next step we'll do in the following section.

Take this file and import it to the FaunaDB GraphQL endpoint using the "IMPORT SCHEMA" button in the dashboard, under the "GRAPHQL" menu option.

Once you do that, you'll get access to the usual GraphQL Playground. Click on the right tab "SCHEMA" and download an SDL version of the schema you just imported.

This is important because we want to avoid using [`introspectSchema` from Apollo Server](https://www.apollographql.com/docs/apollo-server/features/remote-schemas/#introspect-and-delegate-requests) due to the fact that we would be doing a roundtrip request for every first request the user does in order to download the remote schema, and this will make the user interaction feel sluggish.

So, since we want to avoid that, having a local copy in SDL format will help avoid that roundtrip request.

Copy all the contents inside [`remoteSchema.js`](/lib/graphql/remoteSchema.js) and be careful with the parsing, since we are saving all this as a string, you might need to replace a few `` ` ``s for `"`s, and unify some comments with `#` in order to have a correct parsed string.

### FQL Function Definition
