import { list } from '@keystone-next/keystone/schema';
import { text, select, integer, relationship } from '@keystone-next/fields';
import { isSignedIn, rules } from '../access';

// with key stone we can specify the type of input fields we want for our schema fields like text, textarea, select field, which will all be displayed to user/admin as HTML forms.
export const CartItem = list({
  access: {
    create: isSignedIn,
    read: rules.canOrder,
    update: rules.canOrder,
    delete: rules.canOrder,
  },
  // how the items will be displayed, they will be displayed as a list (listView) and what initial columns will be used to display list data
  ui: {
    listView: {
      initialColumns: ['product', 'quantity', 'user'],
    },
  },
  fields: {
    // TODO: custom label in here
    quantity: integer({
      defaultValue: 1,
      isRequired: true,
    }),
    // Here we have a two way relationship where a cart item will link to a user and a user will link to a cart items. Keystone makes it easier for us, some other CMS have us update them on one side or another.
    product: relationship({ ref: 'Product' }),
    user: relationship({ ref: 'User.cart' }),
  },
});
