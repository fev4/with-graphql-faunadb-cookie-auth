const remoteTypeDefs = `
directive @embedded on OBJECT
directive @collection(name: String!) on OBJECT
directive @index(name: String!) on FIELD_DEFINITION
directive @resolver(
  name: String
  paginated: Boolean! = false
) on FIELD_DEFINITION
directive @relation(name: String) on FIELD_DEFINITION
directive @unique(index: String) on FIELD_DEFINITION
input CreateUserInput {
  email: String!
  password: String!
  role: UserRole!
}

scalar Date

type LoginRes {
  userToken: String
  userId: String!
}

# 'LoginRes' input values
input LoginResInput {
  userToken: String
  userId: String!
}

input LoginUserInput {
  email: String!
  password: String!
}

# The 'Long' scalar type represents non-fractional signed whole numeric values.
# Long can represent values between -(2^63) and 2^63 - 1.
scalar Long

type Mutation {
  logoutUser: Boolean!
  # Update an existing document in the collection of 'User'
  updateUser(
    # The 'User' document's ID
    id: ID!
    # 'User' input values
    data: UserInput!
  ): User
  # Create a new document in the collection of 'Thing'
  createThing(
    # 'Thing' input values
    data: ThingInput!
  ): Thing!
  createUser(data: CreateUserInput!): User!
  # Delete an existing document in the collection of 'Thing'
  deleteThing(
    # The 'Thing' document's ID
    id: ID!
  ): Thing
  loginUser(data: LoginUserInput!): LoginRes!
  # Update an existing document in the collection of 'Thing'
  updateThing(
    # The 'Thing' document's ID
    id: ID!
    # 'Thing' input values
    data: ThingInput!
  ): Thing
  # Delete an existing document in the collection of 'User'
  deleteUser(
    # The 'User' document's ID
    id: ID!
  ): User
  signupUser(data: CreateUserInput!): LoginRes!
}

type Query {
  # Find a document from the collection of 'User' by its id.
  findUserByID(
    # The 'User' document's ID
    id: ID!
  ): User
  # Find a document from the collection of 'Thing' by its id.
  findThingByID(
    # The 'Thing' document's ID
    id: ID!
  ): Thing
}

type Thing {
  # The document's ID.
  _id: ID!
  # The document's timestamp.
  _ts: Long!
  owner: User!
  name: String
}

# 'Thing' input values
input ThingInput {
  owner: ThingOwnerRelation
  name: String
}

# Allow manipulating the relationship between the types 'Thing' and 'User' using the field 'Thing.owner'.
input ThingOwnerRelation {
  # Create a document of type 'User' and associate it with the current document.
  create: UserInput
  # Connect a document of type 'User' with the current document using its ID.
  connect: ID
}

# The pagination object for elements of type 'Thing'.
type ThingPage {
  # The elements of type 'Thing' in this page.
  data: [Thing]!
  # A cursor for elements coming after the current page.
  after: String
  # A cursor for elements coming before the current page.
  before: String
}

scalar Time

type User {
  email: String!
  role: UserRole!
  # The document's ID.
  _id: ID!
  things(
    # The number of items to return per page.
    _size: Int
    # The pagination cursor.
    _cursor: String
  ): ThingPage!
  # The document's timestamp.
  _ts: Long!
}

# 'User' input values
input UserInput {
  things: UserThingsRelation
  email: String!
  role: UserRole!
}

enum UserRole {
  FREE_USER
}

# Allow manipulating the relationship between the types 'User' and 'Thing'.
input UserThingsRelation {
  # Create one or more documents of type 'Thing' and associate them with the current document.
  create: [ThingInput]
  # Connect one or more documents of type 'Thing' with the current document using their IDs.
  connect: [ID]
  # Disconnect the given documents of type 'Thing' from the current document using their IDs.
  disconnect: [ID]
}
`;

export { remoteTypeDefs };
