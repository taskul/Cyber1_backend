import 'dotenv/config';
import { list } from '@keystone-next/keystone/schema';
import { text, relationship } from '@keystone-next/fields';
import { cloudinaryImage } from '@keystone-next/cloudinary';
import { isSignedIn, permissions } from '../access';

export const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
  folder: 'cyber-1',
};

// keystone already knows how to work with cloudinary
export const ProductImage = list({
  access: {
    create: isSignedIn,
    read: () => true,
    update: permissions.canManageProducts,
    delete: permissions.canManageProducts,
  },
  fields: {
    image: cloudinaryImage({
      // this is our config file defined above
      cloudinary,
      label: 'Source',
    }),
    altText: text(),
    // we are referencing Product schema and photo field in that schema, which also pointing to this field in this schema
    product: relationship({ ref: 'Product.photo' }),
  },
  // this ui helps to define how the products will be displayed in the list view, so we are indicating that along with id of the product (which is there by default), also show small product image, altText and product name
  ui: {
    listView: {
      initialColumns: ['image', 'altText', 'product'],
    },
  },
});
