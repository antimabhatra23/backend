const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors')
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
require('dotenv/config');
const mongoose = require('mongoose');

// Routes
const catalogsRoutes = require('./routes/catalogs');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

const app = express();
const api = process.env.API_URL;

// Middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());
app.use(authJwt());
app.use(errorHandler);

app.use(`${api}/catalogs`, catalogsRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

// Connect to MongoDB using async/await
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        // Start the server after connecting to the database
        app.listen(3000, () => {
            console.log(`Server is running at http://localhost:3000`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
};

// Connect to the database
connectToDatabase();




