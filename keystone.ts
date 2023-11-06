import 'dotenv/config';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { createAuth } from '@keystone-next/auth';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';
import { User } from './schemas/User';
import { Role } from './schemas/Role';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import { insertSeedData } from './seed-data';
import { sendPasswordResetEmail } from './lib/mail';
import { CartItem } from './schemas/CartItem';
import { OrderItem } from './schemas/OrderItem';
import { Order } from './schemas/Order';
import { extendGraphqlSchema } from './mutations/index';
import { permissionsList } from './schemas/fields';

const databaseURL =
  process.env.DATABASE_URL || 'mongodb://localhost:27017/cyber1';

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 30, // how long should they stay signed in?
  secret: process.env.COOKIE_SECRET || 'asdhoe408#5MgO2%dPlZ!',
};

// auth settings for keystone, it takes a settings object
// listKey is User because it needs to know which schema is going to be responsible for user
// identityField specifies which field in User schema will identify the person, we'll use email, but we could also use username
// initFirstItem is used for when there is no user and we can specify which fields we want to init with like name, email, password
// then we'll add initial roles and our inital user would be an administrator so we'll give them all roles
const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // TODO: Add in inital roles here
  },
  // this is a keystone specific method
  passwordResetLink: {
    // this will give up a token that can be sent to user to reset the password
    async sendToken(args) {
      // send email
      // if we console.log(args) we'll see that it contains token and user email is under identity
      await sendPasswordResetEmail(args.token, args.identity);
    },
  },
});

// credentials: true means that we are going to pass along the cookie that we'll create
// we wrap confit with withAuth that we defined above
export default withAuth(
  config({
    // use @ts.ignore is we get an error related to server field being here
    // @ts.ignore
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: databaseURL,
      // Add data seeding here
      // onConnect we gives ua access to the entire keystone value
      async onConnect(keystone) {
        // we can run a quick check to make sure we are connecting to the database
        // console.log('CONNECTED TO THE DATABASE');
        // so we only going to use the seed data when somebody passes --seed-data as an argument when they run keystone
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(keystone);
        }
      },
    },
    // Here we define data types. Keystone refers to our data types as lists (a list of users, a list of products)
    lists: createSchema({
      // schema items go in here
      User,
      Product,
      ProductImage,
      CartItem,
      OrderItem,
      Order,
      Role,
    }),
    extendGraphqlSchema,
    // we need to create a custom logic for our mutation, and in Keystone we can add our own mutation resolvers.
    // The property extendGraphQLSchema, which allows us to take all of our schemas and add in either our own queries, types or methods.
    ui: {
      // Show the admin UI only for people who pass this test
      isAccessAllowed: ({ session }) =>
        // this console log allows us to see what is being passed on during session, and GraphQL querys defined in session below are printed out in console
        // console.log(session);

        // if there is a session and they are is session.data then we'll return true
        // we also turn it into boolean with two !!
        !!session?.data,
    },
    // session we use withItemData and statelessSessions which come from keystone package
    // we pass in sessionConfig which we defined above
    session: withItemData(statelessSessions(sessionConfig), {
      // This is a GraphQL query-----------
      // we are going to ask for user id every single time which will check permissions. We'll pass the ID and any other data we query along with every single session. Then everytime we want o access the session we have access to the user's name, email, ID etc.
      // permissionsList comes from schema/fields where it is an array of keys of permission objects, those keys are the aviable roles that we have. In graphQL we have to be explicit with stating every role we want user to have, there is no get all roles. So we work around that by using permissionsList array with all keys that we turn into a string and add it to a graphQL query string
      User: `id name email role { ${permissionsList.join(' ')} }`,
    }),
  })
);
