import { CartItem } from '../schemas/CartItem';
import { User } from '../schemas/User';
import {
  CartItemCreateInput,
  OrderCreateInput,
} from '../.keystone/schema-types';

/* eslint-disable */
import { KeystoneContext, SessionStore } from '@keystone-next/types';
import stripeConfig from '../lib/stripe';

// we do this for better syntax highlighting when making graphql query
const graphql = String.raw;

// on the front end when user enters credit card info the transaction will create an object paymentMethod that will have an id, that id is the token
interface Arguments {
  token: string;
}

async function checkout(
  root: any,
  { token }: Arguments,
  context: KeystoneContext
): Promise<OrderCreateInput> {
  // 1. Make sure they are signed in
  const userId = context.session.itemId;
  if (!userId) {
    throw new Error('Sorry! You must be signed in to create an order!');
  }

  const user = await context.lists.User.findOne({
    where: { id: userId },
    // we defined graphql at the top as String.raw so we can have better graphql syntax highlighting
    resolveFields: graphql`
      id
      name
      email
      cart {
        id
        quantity
        product {
          name
          price
          description
          id
          photo {
            id
            image {
              id
              publicUrlTransformed
            }
          }
        }
      }
    `,
  });
  // we use .dir and depth: null here because it won't truncate any objects that we are logging in our terminal here
  console.dir(user, { depth: null });
  // 2. calculate the total price for their order
  // in case there are some cart items present that were deleted this will filter that out
  const cartItems = user.cart.filter((cartItem) => cartItem.product);
  const amount = cartItems.reduce(function (
    tally: number,
    cartItem: CartItemCreateInput
  ) {
    return tally + cartItem.quantity * cartItem.product.price;
  },
  0);

  // 3. create the charge with the stripe library
  const charge = await stripeConfig.paymentIntents
    .create({
      amount,
      currency: 'USD',
      confirm: true,
      payment_method: token,
    })
    .catch((err) => {
      console.log(err);
      throw new Error(err.message);
    });
  console.log('CHARGE', charge);
  // 4. convert the cartItems to OrderItems, we can leave them as just regular products
  const orderItems = cartItems.map((cartItem) => {
    const orderItem = {
      name: cartItem.product.name,
      description: cartItem.product.description,
      price: cartItem.product.price,
      quantity: cartItem.quantity,
      // this is how we make a relationship by connecting id to cartItem.product.photo.id
      // we use photo as key because we named it photo in OrderItem.ts
      photo: { connect: { id: cartItem.product.photo.id } },
    };
    return orderItem;
  });
  console.log('CREATING an order');
  // 5> Create the order and return it
  const order = await context.lists.Order.createOne({
    data: {
      // we are pulling the amount straight off the actual charge. that way we are 100% sure that is teh amount that was charged to their credit card.
      total: charge.amount,
      charge: charge.id,
      // we are creating an order that will have a relationship with many items and we are giving it an array orderItems
      items: { create: orderItems },
      user: { connect: { id: userId } },
    },
    resolveFields: false,
  });
  // 6 clean up any old cart items
  // we remove items from cart associated with user which is why we are using user.cart.map
  const cartItemIds = user.cart.map((cartItem) => cartItem.id);
  await context.lists.CartItem.deleteMany({
    ids: cartItemIds,
  });
  return order;
}

export default checkout;
