import { list } from '@keystone-next/keystone/schema';
import {
  text,
  select,
  integer,
  relationship,
  virtual,
} from '@keystone-next/fields';
import formatMoney from '../lib/formatMoney';
import { isSignedIn, rules } from '../access';

// with key stone we can specify the type of input fields we want for our schema fields like text, textarea, select field, which will all be displayed to user/admin as HTML forms.
export const Order = list({
  access: {
    create: isSignedIn,
    read: rules.canOrder, // can read an order as an admin or owner of the order
    update: () => false, // the update is alwayd going to be false for this case
    delete: () => false,
  },
  fields: {
    // here we are creating a custom label
    // virtual field is something that is calculated on demand, it's not actually a value that is stored in the database, but it is something that is just generated as we need it.
    label: virtual({
      // since it is not in the database we need to specify what graphsQL api will return
      graphQLReturnType: 'String',
      resolver(item) {
        // here is what will actually show up as a label for the item order, by default it would be order id, but now it will be order total as the label
        return `${formatMoney(item.total)}`;
      },
    }),
    total: integer(),
    // has two way relationship to OrderItem field order, and it can be connected to multiple orders
    items: relationship({ ref: 'OrderItem.order', many: true }),
    // has two way relationship to User field orders
    user: relationship({ ref: 'User.orders' }),
    charge: text(),
  },
});
