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

Copy all the contents from the recently downloaded SDL file inside [`remoteSchema.js`](/lib/graphql/remoteSchema.js) and be careful with the parsing, since we are saving all this as a string, you might need to replace a few `` ` ``s for `"`s, and unify some comments with `#` in order to have a correct parsed string.

### User Defined Functions (UDFs)

Here's where the magic starts. As you saw earlier we used `@resolver` directives to tell Fauna that we plan to define some functions. We'll do just that and define some more, in total we'll create 5 UDFs, 4 which will be used by the `@resolver` directives, and 1 which will be used directly by our local-defined schema (more on that later).

Check out the [`exampleFunctions.js`](/lib/fauna/exampleFunctions.js) file where I've defined these 5 functions. Let's explain what each one does.

- `create_user`: Uses the [`Create` function](https://docs.fauna.com/fauna/current/api/fql/functions/create) along with the `credentials` field name to set permissions for the `User` document.
- `login_user`: Uses the [`Login` function](https://docs.fauna.com/fauna/current/api/fql/functions/login) to match the input data against the previously mentioned `credentials` and from the returned object we [`Select`](https://docs.fauna.com/fauna/current/api/fql/functions/select) the `secret`. Notice that we also use the field name `ttl` to set a time to live of 14 days from the login moment, but [as the docs specify](https://docs.fauna.com/fauna/current/api/fql/functions/login) this is not a guarantee for the token to expire at that precise point in time.
- `logout_user`: This one is easy. It simply uses the [`Logout` function](https://docs.fauna.com/fauna/current/api/fql/functions/logout) and passes the `true` parameter to tell Fauna to delete all tokens related to the current [`Identity`](https://docs.fauna.com/fauna/current/api/fql/functions/identity).
- `signup_user`: Here we use the [`Do` function](https://docs.fauna.com/fauna/current/api/fql/functions/do) to [`Call`](https://docs.fauna.com/fauna/current/api/fql/functions/call) the `create_user` and `login_user` functions in sequence. Bare in mind that `Do` returns the result of the latest `Call`ed function, which is precisely what we want.
- `validate_token`: Lastly the most important function in my opinion which unifies the whole concept of httpOnly cookies and takes care of syncing the user with the state of the [`Tokens`](https://docs.fauna.com/fauna/current/api/fql/functions/tokens) in the DB. It simply tells us if the passed token is valid or not, by passing it to [`KeyFromSecret`](https://docs.fauna.com/fauna/current/api/fql/functions/keyfromsecret) and evaluating if it is not null.

In order to create these functions, be sure to go to the "FUNCTIONS" menu in Fauna's dashboard, there you should already see at least the first 4 functions defined through the schema with an empty `Lambda`. These were automatically created during the import process in the previous step.

What you need to do is then copy-paste each function inside Fauna's dashboard. One important thing here is the "Role" dropdown selector (which is marked as optional). We will use these drop-downs to select the roles (which we'll create in the next step) that each function has. Ultimately, these roles simply define the resources, in other words, the privileges each function has access to.

### User Defined Roles

Here's a very important part to the whole ABAC implementation. It's a very flexible part of Fauna, which makes it really powerful, and so it can be tricky to configure if not done right from the beginning, or at least if not done with a plan in mind.

Here's the plan. We want to define roles for each function that we previously created, and then we want to define two more roles, one for the `User` document and lastly one role for public use, simply called `public`, where we will give access to a couple of functions that should be available to anyone _not logged in_.

In order to keep this short, because the roles can get quite large, I've created a file called [exampleRoles.js](/lib/fauna/exampleRoles.js) where you can take a look at all of them. In the following points, I'll highlight anything important from each of those.

But before that, I want to focus your attention on the functions [`CreateRole`](https://docs.fauna.com/fauna/current/api/fql/functions/createrole) and [Update](https://docs.fauna.com/fauna/current/api/fql/functions/update). These will be quite used for you in order to create and update roles respectively, so here's how using these would look like:

```
CreateRole()
```
