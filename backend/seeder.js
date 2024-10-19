import mongoose from "mongoose";
import dotenv from 'dotenv';
import users from './data/users.js';
import products from './data/productsData.js';
import User from './models/userModels.js';
import Product from './models/productModels.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();


const importData = async () => {
    try {
        await Product.deleteMany();
        await User.deleteMany();

        const createdUsers = await User.insertMany(users);


        const sampleProducts = products.map((product)=>{
            return {...product};
        });

        await Product.insertMany(sampleProducts);

        console.log('Data Imported!');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

const destroyData = async() =>{
    try {

        await Product.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
        
    } catch (error) {
        console.error(`${errro}`);
        process.exit(1);
    }
}


if(process.argv[2] === '-d'){
    destroyData();
}else{
    importData();
}