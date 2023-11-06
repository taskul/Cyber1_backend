import { graphQLSchemaExtension } from '@keystone-next/keystone/schema';
import addToCart from './addToCart';
import checkout from './checkout';

// make a fake graphQL tagged template literal
const graphql = String.raw;

export const extendGraphqlSchema = graphQLSchemaExtension({
  // typeDefs is what is the name of the method, what arguments does it take, and what does it return.
  // here will write graphQL mutation as a raw string
  typeDefs: graphql`
    type Mutation {
      addToCart(productId: ID): CartItem
      # checkout mutation that will return Order.
      checkout(token: String!): Order
    }
  `,
  // resolvers are links to node.js functions that will run when those things are requested upon via GraphQL API
  resolvers: {
    Mutation: {
      addToCart,
      checkout,
    },
  },
});
