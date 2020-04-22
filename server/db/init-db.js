const faker = require('faker');
const models = require('./models');
let mockProducts = require('./products.json');

const {
  User, Auth, Product, syncDB,
} = models;

const users = [];
const products = [];

function generateMockData() {
  return new Promise((resolve) => {
    for (let i = 0; i < 20; i += 1) {
      if (i === 0) {
        users.push({
          firstName: 'Sam',
          lastName: 'John',
          email: 'sam@gmail.com',
          mobile: '+123789',
          password: 'test@123',
          address: faker.address.streetAddress(),
          credits: 1000000,
          auth: {
            pin: 1234,
          },
        });


        users.push({
          firstName: 'Jack',
          lastName: 'Bolt',
          email: 'jack@gmail.com',
          mobile: '+123789',
          password: 'test@123',
          address: faker.address.streetAddress(),
          credits: 1000000,
          auth: {
            pin: 1234,
          },
        });

      } else {
        users.push({
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: faker.internet.email(),
          mobile: faker.phone.phoneNumber(),
          password: faker.internet.password(),
          address: faker.address.streetAddress(),
          credits: faker.random.number({ min: 1000, max: 5000 }),
          auth: {
            pin: faker.random.number({ min: 1000, max: 9999 }),
          },
        });
      }
    }

    for (let i = 0; i < 20; i += 1) {
      products.push({
        name: mockProducts[i].name,
        price: parseInt(mockProducts[i].price, 10),
        description: mockProducts[i].description,
        imageUrl: mockProducts[i].imageUrl,
        quantity: 2
      });
    }

    resolve();
  });
}

generateMockData().then(async () => {
  await syncDB();

  console.info('Creating mock users...');
  users.forEach(async (user) => {
    await User.create(user, {
      include: [{
        model: Auth,
        as: 'auth',
      }],
    });
  });

  console.info('Creating mock products...');
  products.forEach(async (product) => {
    await Product.create(product);
  });
});
