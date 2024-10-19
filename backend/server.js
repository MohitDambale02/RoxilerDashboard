import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import connectDB from './config/db.js';
import productRoutes from './router/productRoutes.js';
import {notFound, errorHandler } from './middleware/errorMiddleware.js';


const PORT = process.env.PORT;

connectDB();

const app = express();

app.use(express.json());

// var cors = require('cors');

app.use(cors());

app.use('/api/products', productRoutes);


app.use(notFound);
app.use(errorHandler);

app.listen(PORT,(req, res)=>{
    console.log(`Backend server is running on ${PORT}`);
})