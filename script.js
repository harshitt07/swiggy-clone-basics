const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

axios.get('http://localhost:3001/getRestaurant')
    .then(response => {
        const serviceQuality = document.getElementById('serviceQuality');
        response.data.data.forEach(option => {
            const optionTag = document.createElement('option');
            optionTag.value = option._id;
            optionTag.text = option.restaurantName + ', ' + option.details.address;
            serviceQuality.appendChild(optionTag);
        });
    })
    .catch(error => {
        console.error(error);
    });

let emailId = "";
let cart = [];

function login() {
  const email = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  axios.post('http://localhost:3001/login', {
    email,
    password
  })
    .then((response) => {
      emailId = email;
      alert(response.data.message);
      refreshOrder();
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
    })
    .catch(error => {
        console.error(error);
    });
}

function forgotPassword() {
  const email = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  console.log(username, password);
  axios.post('http://localhost:3001/forgotPassword', {
    email,
    password
  })
    .then((response) => {
      console.log(response);
      alert(response.data.message);
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
    })
    .catch(error => {
        console.error(error);
    });
}

function signup() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const contact = document.getElementById('contact').value.trim();
  const password = document.getElementById('signup_password').value.trim();
  // console.log(password);
  axios.post('http://localhost:3001/signup', {
    name, email, contact, password
  })
    .then((response) => {
      console.log(response);
      alert(response.data.message);
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('contact').value = '';
      document.getElementById('signup_password').value = '';
    })
    .catch(error => {
        console.error(error);
    });
}

// To Add Email Check Here
function displayFood() {
  var restaurantId = document.getElementById("serviceQuality").value;
  // console.log(restaurantId);
  axios.get(`http://localhost:3001/getRestaurant?id=${restaurantId}`)
    .then(response => {
      const foodItemsContainer = document.getElementById('food-list');
      const cartContainer = document.getElementById('cartContainer');
      foodItemsContainer.innerHTML = '';
      cartContainer.innerHTML = '';
     
      // console.log(response.data.data);
      response.data.data.forEach(restaurant => {
        const foodItems = restaurant.foodItems;
          console.log(foodItems);
          for(const key in foodItems) {

            const foodItemList = foodItems[`${key}`];
            // console.log(foodItemList);
            foodItemList.forEach(foodItem => {
              // console.log(foodItem);
              const foodItemElement = document.createElement('div');
              // foodItemElement.classList.add('food-item');
              foodItemElement.innerHTML = `
                <span>${foodItem.name} - Rs ${foodItem.price}</span>
                <button onclick="addToCart('${restaurantId}', '${foodItem.id}', '${foodItem.name}', ${foodItem.price})">Add to Cart</button>
              `;
              foodItemsContainer.appendChild(foodItemElement);
            });
          }
      });
    })
    .catch(error => {
        console.error(error);
    });
}

// Cart API

// Add Email Check
function addToCart(restaurantId, foodId, foodName, foodPrice) {
  // console.log(restaurantId, foodId, foodName, foodPrice);
  let updatedIndex = -1;

  // Find this foodId in Cart
  for(let i = 0; i < cart.length; i++) {
    if(cart[i].foodId === foodId) {
      updatedIndex = i;
      break;
    }
  }

  // Update the Cart
  if(updatedIndex != -1) {
    cart[updatedIndex].quantity += 1;
    cart[updatedIndex].totalPrice += foodPrice;
  } else {
    cart.push({
      restaurantId, foodId, foodName, foodPrice, quantity: 1, totalPrice: foodPrice
    });
  }
  console.log(cart);
  refreshCart();
}

// Add Email Check
function removeFromCart(foodId) {
  let removedIndex = -1;

  // Find this foodId in Cart
  for(let i = 0; i < cart.length; i++) {
    if(cart[i].foodId == foodId) {
      removedIndex = i;
      break;
    }
  }

  // Update the Index
  if(removedIndex != -1) {
    if(cart[removedIndex].quantity == 1) {
      cart.splice(removedIndex, 1);
    } else {
      cart[removedIndex].quantity -= 1;
      cart[removedIndex].totalPrice -= cart[removedIndex].foodPrice;
    }
  }
  refreshCart();
}

function refreshCart() {
  const cartContainer = document.getElementById('cartContainer');
  cartContainer.innerHTML = '';
  // Display cart items
  cart.forEach(cartItem => {
    const cartItemElement = document.createElement('div');
    // cartItemElement.classList.add('cart-item');
    cartItemElement.innerHTML = `
      <span>${cartItem.foodName} - Rs ${cartItem.foodPrice} - ${cartItem.quantity} units - Rs ${cartItem.totalPrice} </span>
      <button onclick="removeFromCart(${cartItem.foodId})">Remove</button>
    `;
    cartContainer.appendChild(cartItemElement);
  });
  if(cart.length) {
    const button = document.createElement("button");
    button.textContent = "Place Order";
    button.addEventListener("click", function() {
      placeOrder();
    });
    cartContainer.appendChild(button);
  }
}

// Order APIs
function placeOrder() {
  if(emailId) {
    axios.post('http://localhost:3001/addOrder', {
      email: emailId,
      cart
    })
      .then((response) => {
        // console.log(response);
        alert(response.data.message);
        cart = [];
        refreshCart();
        refreshOrder();
      })
      .catch(error => {
          console.error(error);
      });
  } else {
    alert('User Not Logged In!');
  }
}

function refreshOrder() {
  console.log(emailId);
  const orderContainer = document.getElementById('orderHistoryContainer');
  orderContainer.innerHTML = '';

  axios.get(`http://localhost:3001/getOrders?email=${emailId}`)
    .then(response => {
      console.log(response);

      response.data.data.forEach(orders => {

        const orderListElement = document.createElement('div');
        orders.cart.forEach(cartItem => {
          const cartItemElement = document.createElement('div');
          cartItemElement.innerHTML = `<span>${cartItem.foodName} - Rs ${cartItem.foodPrice} - ${cartItem.quantity} units - Rs ${cartItem.totalPrice} </span>`;
          orderListElement.appendChild(cartItemElement);
        });
        const priceItemElement = document.createElement('div');
        const date = new Date(orders.orderedOn);
        const istTime = date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        priceItemElement.innerHTML = `<span>Total Cost - Rs ${orders.totalPrice} and Order Placed On ${istTime}</span>`;
        orderListElement.appendChild(priceItemElement);

        orderContainer.append(orderListElement);
        orderContainer.append(document.createElement('br'));
      });


      
    })
    .catch(error => {
        console.error(error);
    });
}