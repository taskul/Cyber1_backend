import { KeystoneContext } from '@keystone-next/types';
import { CartItemCreateInput } from '../.keystone/schema-types';
import { Session } from '../types';

async function addToCart(
  root: any,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItemCreateInput> {
  // 1 Query the current user and see if they are signed in
  const sesh = context.session as Session;
  if (!sesh.itemId) {
    throw new Error('You must be logged in to do this!');
  }
  // 2 Query the current user's cart
  // with Keystone we can reach directly into the lists and run a function that will find the items for us.
  const allCartItems = await context.lists.CartItem.findMany({
    // where user id is equal to sesh.itemId and product id equalt to productId
    where: { user: { id: sesh.itemId }, product: { id: productId } },
    resolveFields: 'id,quantity',
  });
  // 3 See if the current item is in their cart already
  // -- 4 if it is increment by 1
  const [existingCartItem] = allCartItems;
  if (existingCartItem) {
    console.log(
      `This item is already ${existingCartItem.quantity} in cart, increment by 1`
    );
    return await context.lists.CartItem.updateOne({
      id: existingCartItem.id,
      data: { quantity: existingCartItem.quantity + 1 },
    });
  }
  // -- 5 if it isn't create a new cart item
  return await context.lists.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: sesh.itemId } },
    },
    resolveFields: false,
  });
}

export default addToCart;
