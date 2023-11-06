import { text, password, relationship } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';
import { permissions, rules } from '../access';

// named export is used here, because it make auto import work a little bit nicer
export const User = list({
  // access
  access: {
    create: () => true, // because everyone can sign up for services
    read: rules.canManageUsers,
    update: rules.canManageUsers,
    // only people with the permission can delete themselves
    //  you can't delete yourself
    delete: permissions.canManageUsers,
    // the difference between permissions and rules is that permissions you must have the checkbox under your role, while rules is either the check box or yourself.
  },
  // ui
  ui: {
    // this will hide backend UI from regular users
    hideCreate: (args) => !permissions.canManageUsers(args),
    hideDelete: (args) => !permissions.canManageUsers(args),
  },
  fields: {
    name: text({ isRequired: true, isUnique: true, isIndexed: true }),
    email: text({ isRequired: true, isUnique: true }),
    password: password(),
    cart: relationship({
      ref: 'CartItem.user',
      many: true,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    // User has a two way relationship to Order that has field user, and user can be connected to multiple orders
    orders: relationship({ ref: 'Order.user', many: true }),
    role: relationship({
      // two way relationship set up with Role schema column assignedTo, and that field is pointing to User.role
      ref: 'Role.assignedTo',
      // Access Control, locking down user
      // A regular user can signs up for services and update themselves
      access: {
        create: permissions.canManageUsers,
        update: permissions.canManageUsers,
      },
    }),
    products: relationship({
      ref: 'Product.user',
      many: true, // because the user may have many products
    }),
  },
});
