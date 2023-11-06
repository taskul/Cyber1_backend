import { list } from '@keystone-next/keystone/schema';
import { text, select, integer, relationship } from '@keystone-next/fields';
import { isSignedIn, rules } from '../access';

// with key stone we can specify the type of input fields we want for our schema fields like text, textarea, select field, which will all be displayed to user/admin as HTML forms.
export const Product = list({
  // access:
  // here we could state true/false for each value to control each CRUD action, or we can use a funciton that will control that for us
  // here we are checking to see if user is even signed in or not so then non users can not do any of the CRUD queries
  access: {
    create: isSignedIn,
    read: rules.canReadProducts,
    update: rules.canManageProducts,
    delete: rules.canManageProducts,
  },
  // ui fields
  fields: {
    name: text({ isRequired: true }),
    description: text({
      ui: {
        displayMode: 'textarea',
      },
    }),
    // we are referencing ProductImage schema and product field in that schema, which also pointing to this field in this schema
    photo: relationship({
      ref: 'ProductImage.product',
      // ui is used to configure how our image and image fields are displayed
      ui: {
        displayMode: 'cards',
        cardFields: ['image', 'altText'],
        inlineCreate: { fields: ['image', 'altText'] },
        inlineEdit: { fields: ['image', 'altText'] },
      },
    }),
    status: select({
      options: [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Available', value: 'AVAILABLE' },
        { label: 'Unavailable', value: 'UNAVAILABLE' },
      ],
      defaultValue: 'DRAFT',
      // ui allows us to control some values on how this select field should be displayed in HTML for user/admin
      ui: {
        displayMode: 'segmented-control',
        // if we wanted to hide
        // createView: { fieldMode: 'hidden' },
      },
    }),
    // prices work in 100s, so $24.99 price we would enter 2499 in this field
    price: integer(),
    // when the product is created, make a relationship to user.products adn then the default value is going to be the currently signed user.
    user: relationship({
      ref: 'User.products',
      defaultValue: ({ context }) => ({
        connect: { id: context.session.itemId },
      }),
    }),
  },
});
