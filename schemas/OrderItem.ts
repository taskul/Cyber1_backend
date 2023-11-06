import { list } from '@keystone-next/keystone/schema';
import { text, select, integer, relationship } from '@keystone-next/fields';
import { isSignedIn, rules } from '../access';

// with key stone we can specify the type of input fields we want for our schema fields like text, textarea, select field, which will all be displayed to user/admin as HTML forms.
export const OrderItem = list({
  access: {
    create: isSignedIn,
    read: rules.canManageOrderItems,
    update: () => false,
    delete: () => false,
  },
  fields: {
    name: text({ isRequired: true }),
    description: text({
      ui: {
        displayMode: 'textarea',
      },
    }),
    // we are referencing ProductImage schema and product field in that schema
    photo: relationship({
      ref: 'ProductImage',
      // ui is used to configure how our image and image fields are displayed
      ui: {
        displayMode: 'cards',
        cardFields: ['image', 'altText'],
        inlineCreate: { fields: ['image', 'altText'] },
        inlineEdit: { fields: ['image', 'altText'] },
      },
    }),
    // prices work in 100s, so $24.99 price we would enter 2499 in this field
    price: integer(),
    quantity: integer(),
    order: relationship({ ref: 'Order.items' }),
  },
});
