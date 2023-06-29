const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db')

const PORT = 3001;

app.use(express.json());
app.use(cors());

let db;

// connectToDb();
// db = getDb();

// function abc(err) {
//   if(!err) {
//     db = getDb();
//   }
// }

// try {
//   connectToDb();
//   db = getDb();
// } catch(err) {
//   console.log(err);
// }

MongoClient.connect('mongodb+srv://ppa:ppaproject@swiggy-clone.mrrlfe0.mongodb.net/?retryWrites=true&w=majority')
  .then((client) => {
      db = client.db('swiggy-clone');
  })
  .catch(err => {
      console.log(err);
  });

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    const result = await db.collection('user_credentials').find({email}).toArray();
    console.log(result);
    if(result.length) {
      if(result[0].password === password) {
      res.json({ message: 'Login Successful', details: result });
    } else {
      res.json({ message: 'Invalid password' });
    }
    } else {
      res.json({ message: 'User Doesn\'t Exists' });
    }
  } else {
    res.json({ message: 'Invalid username or password' });
  }
});

app.post('/signup', async (req, res) => {
  const { name, email, contact, password } = req.body;
  if (email && password && name && contact) {
    const result = await db.collection('user_credentials').find({email}).toArray();
    console.log(result);
    if(result.length) {
      res.json({ message: 'User Already Exists' });
      return;
    }
    const newUser = { name, email, contact, password, createdOn: Date.now(), lastUpdatedOn: Date.now() }
    await db.collection('user_credentials').insertOne(newUser);
    res.json({ message: 'User created successfully' });
  } else {
    res.json({ message: 'Invalid username or password' });
  }
});

app.post('/forgotPassword', async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    const result = await db.collection('user_credentials').find({email}).toArray();
    console.log(result);
    if(!result.length) {
      res.json({ message: 'User Doesn\'t Exists' });
      return;
    }
    await db.collection('user_credentials').updateOne(
      { email },
      { $set: { password: password } }
    );
    res.json({ message: 'Password updated successfully' });
  } else {
    res.json({ message: 'Invalid username or password' });
  }
});

app.get('/getRestaurant', async (req, res) => {
  const { food, location, id } = req.query;
  // console.log(id);
  // const objectId = new ObjectId("649412bdcd956fe8784ae3f0");
  let data = [];
  const result = await db.collection('restaurants').find({}).toArray();
  // console.log(food, location);

  if(id) {
    // console.log('Inside Id');
    result.forEach(element => {
      const _id = (element._id).toString();
      // console.log(_id);
      if(_id === id) {
        data.push(element);
      }
    });
  }

  // Food Filters
  else if(food) {
    console.log(food);
    result.forEach(element => {
      const foodItems = element.foodItems;
      for(const key in foodItems) {
        const foodItemList = foodItems[`${key}`];
        foodItemList.forEach(foodItem => {
          if(foodItem.name === food) {
            data.push(element);
          }
        });
      }
    });
  }

  // Location Filters
  else if(location) {
    result.forEach(element => {
      if(element.details.address === location) {
          data.push(element);
        }
    });
  } else {
    data = result;
  }
  res.json({ message: 'Got Details', data });
})

app.post('/addRestaurant', async (req, res) => {
  const restaurantDetails = req.body;
  const result = await db.collection('restaurants').insertOne({
    ...restaurantDetails,
    createdOn: Date.now(),
    lastUpdatedOn: Date.now()
  });
  res.json({ message: 'Restaurant Added Successfully' });
});

app.post('/addOrder', async (req, res) => {
  const orderDetails = req.body;
  let totalPrice = 0;
  orderDetails.cart.forEach(order => totalPrice += order.totalPrice);
  // console.log(orderDetails);
  const order = {
    // email: "h@gmail.com",
    ...orderDetails,
    totalPrice,
    orderStatus: "ORDER_PLACED",
    orderedOn: Date.now(),
    // lastUpdatedOn: Date.now()
  }
  console.log(order);
  const result = await db.collection('orders').insertOne(order);
  const orderId = (result.insertedId.toString());
  res.json({ message: `Order Placed Successfully. Your Order ID is ${orderId}` });
});

app.get('/getOrders', async (req, res) => {
  const { email } = req.query;
  const result = await db.collection('orders').find({
    email
  }).sort({orderedOn: -1}).toArray();
  res.json({ data: result });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
