// This is an access control function that will return true or false on what permissions user has based on a role

import { permissionsList } from './schemas/fields';
import { ListAccessArgs } from './types';

// at it's simplest, the access control is a yes or no value depending of the user's session

export function isSignedIn({ session }: ListAccessArgs) {
  // double bag !! coerces truthy or falsey values to a true boolean
  return !!session;
}

const generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function ({ session }: ListAccessArgs) {
      return !!session?.data.role?.[permission];
    },
  ])
);

// dynamic permissions management
// Permissions check if someone meets a criteria - yes or no
export const permissions = {
  ...generatedPermissions,
  // we can add additional permissions too
  isAwesome({ session }: ListAccessArgs) {
    return session?.data.name.includes('tas');
  },
};

// Rule based functions - are logical funcntions that can be user for list access of different types like products, users, orders, cart items.
// Rules can return a boolean - yes/no - or a filter which limits which products they can access.
export const rules = {
  canManageProducts({ session }: ListAccessArgs) {
    // 1. Is user signed in
    if (!isSignedIn({ session })) {
      return false;
    }
    // 2. Do they have the permission of canManageProducts
    if (permissions.canManageProducts({ session })) {
      return true;
    }
    // 3. if not, do they own this item?
    // this is where we graphQL "where" query is done to try to match user with item
    return { user: { id: session.itemId } };
  },
  canOrder({ session }: ListAccessArgs) {
    // 1. Is user signed in
    if (!isSignedIn({ session })) {
      return false;
    }
    // 2. Do they have the permission of canManageCart
    if (permissions.canManageCart({ session })) {
      return true;
    }
    // 3. if not, then user should only be able to update items that they own whether that is a cart item or whether that is an order item and an actual order iteself
    // this is where we graphQL "where" query is done to try to match user with item
    return { user: { id: session.itemId } };
  },
  canManageOrderItems({ session }: ListAccessArgs) {
    // 1. Is user signed in
    if (!isSignedIn({ session })) {
      return false;
    }
    // 2. Do they have the permission of canManageCart
    if (permissions.canManageCart({ session })) {
      return true;
    }
    // 3. if not, do they own this item?
    // since we don't have a relationship between OrderItem and User, we go through order to find user info
    return { order: { user: { id: session.itemId } } };
  },
  canReadProducts({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageProducts({ session })) {
      return true; // They can read everything!
    }
    // They should only see available products (based on the status field)
    return { status: 'AVAILABLE' };
  },
  canManageUsers({ session }: ListAccessArgs) {
    // 1. Is user signed in
    if (!isSignedIn({ session })) {
      return false;
    }
    // 2. Do they have the permission to manaage users. we need to have this in place for admins so then only admins can change roles
    if (permissions.canManageUsers({ session })) {
      return true;
    }
    // otherwise they may only update themselves
    return { id: session.itemId };
  },
};

// manual management of permissions one by one
// export const permissions = {
//   canManageProducts({ session }) {
//     // session queries info about user at each query and it returns data that inclludes infro about the user, so we can look into user's role, and see if canManageProducts is there which would return true or false depending on if it exists or not
//     // we also check with "?" to see if session exists in case user is not signed in, and if they have role assigned to them or not
//     return session?.data.role?.canManageProducts;
//   },
//   canManageProducts({ session }) {
//     return session?.data.role?.canManageProducts;
//   },
// };
