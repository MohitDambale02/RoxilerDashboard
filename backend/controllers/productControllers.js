import asyncHandler from "../middleware/asyncHandler.js"
import Product from '../models/productModels.js';
import axios from 'axios';

// @desc Fetch all products filtered by month
// @route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
    const pageSize = process.env.PAGINATION_LIMIT || 10; // Default pagination limit
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {};

    // Extract the month from query parameters (assuming 'month' is passed in the query)
    const { month } = req.params;
   const selectedMonth = parseInt(month, 10); // Convert month to an integer

    // Validate the month (must be between 1 and 12)
    if (selectedMonth < 1 || selectedMonth > 12) {
        return res.status(400).json({ message: 'Invalid month. Please provide a value between 1 and 12.' });
    }

    // Filter products based on the selected month (regardless of the year)
    const monthQuery = {
        $expr: { $eq: [{ $month: "$dateOfSale" }, selectedMonth] }
    };

    // Combine the keyword search and month filter
    const filterQuery = { ...keyword, ...monthQuery };

    // Count the total number of filtered products
    const count = await Product.countDocuments({ ...filterQuery });

    // Fetch the products, applying pagination and filtering by the selected month
    const products = await Product.find({ ...filterQuery })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    // Send the response with products and pagination details
    res.json({
        products,
        page,
        pages: Math.ceil(count / pageSize)
    });
});
// @desc Fetch all products filtered by month and optional keyword
// @route GET /api/products
// @access Public
const getSearchProducts = asyncHandler(async (req, res) => {
    const pageSize = Number(process.env.PAGINATION_LIMIT) || 10; // Ensure pageSize is a valid number
    const page = Number(req.query.pageNumber) || 1;  // Ensure page is a valid number
    const selectedMonth = Number(req.query.month);   // Ensure selectedMonth is a number

    // Validate the month (ensure it's between 1 and 12)
    if (isNaN(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
        return res.status(400).json({ message: 'Invalid month. Please provide a value between 1 and 12.' });
    }

    // Filter products by month using $month on dateOfSale field
    const monthQuery = {
        $expr: { $eq: [{ $month: "$dateOfSale" }, selectedMonth] }
    };

    // Handle search keyword (if provided) to filter by title, description, or price
    let keyword = {};
    if (req.query.keyword) {
        const searchText = req.query.keyword.trim();
        const price = Number(searchText);

        // If keyword is a valid number, include price in the search
        if (!isNaN(price)) {
            keyword = {
                $or: [
                    { title: { $regex: searchText, $options: 'i' } },        // Case-insensitive match
                    { description: { $regex: searchText, $options: 'i' } }, // Case-insensitive match
                    { price: price }                                        // Match exact price if it's a valid number
                ]
            };
        } else {
            keyword = {
                $or: [
                    { title: { $regex: searchText, $options: 'i' } },        // Case-insensitive match
                    { description: { $regex: searchText, $options: 'i' } }  // Case-insensitive match
                ]
            };
        }
    }

    // Combine the month and keyword queries
    const filterQuery = { ...monthQuery, ...keyword };

    try {
        // Count the total number of products matching the query
        const count = await Product.countDocuments(filterQuery);

        // Fetch the products with pagination
        const products = await Product.find(filterQuery)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        // Send back the products, current page, and total number of pages
        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize)
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error. Could not retrieve products.' });
    }
});

 const getMonthlyStatistics = asyncHandler(async (req, res) => {
   const { month } = req.params;
   const selectedMonth = parseInt(month, 10); // Convert month to an integer

   // Validate that the month is between 1 and 12
   if (selectedMonth < 1 || selectedMonth > 12) {
       return res.status(400).json({ message: 'Invalid month. Please provide a value between 1 and 12.' });
   }

   // Find all sold items in the selected month (regardless of the year)
   const soldItems = await Product.find({
       sold: true,
       $expr: { $eq: [{ $month: "$dateOfSale" }, selectedMonth] }
   });

   // Calculate total sale amount for the selected month
   const totalSalesAmount = soldItems.reduce((sum, item) => sum + item.price, 0);

   // Total number of sold items in the selected month
   const totalSoldItems = soldItems.length;

   // Find all not sold items in the selected month (regardless of the year)
   const unsoldItems = await Product.find({
       sold: false,
       $expr: { $eq: [{ $month: "$dateOfSale" }, selectedMonth] }
   });

   const totalUnsoldItems = unsoldItems.length;

   // Send the response with the statistics
   res.status(200).json({
       totalSalesAmount,
       totalSoldItems,
       totalUnsoldItems
   });
});

const getPriceRangeStatistics = asyncHandler(async (req, res) => {
   const { month } = req.params;
   const selectedMonth = parseInt(month, 10); // Convert month to an integer

   // Validate that the month is between 1 and 12
   if (selectedMonth < 1 || selectedMonth > 12) {
       return res.status(400).json({ message: 'Invalid month. Please provide a value between 1 and 12.' });
   }

   // Find all items sold in the selected month, regardless of the year
   const products = await Product.find({
       $expr: { $eq: [{ $month: "$dateOfSale" }, selectedMonth] }
   });

   // Initialize price range categories
   const priceRanges = {
       "0-100": 0,
       "101-200": 0,
       "201-300": 0,
       "301-400": 0,
       "401-500": 0,
       "501-600": 0,
       "601-700": 0,
       "701-800": 0,
       "801-900": 0,
       "901-above": 0
   };

   // Iterate over the products and classify them into price ranges
   products.forEach(product => {
       const price = product.price;

       if (price >= 0 && price <= 100) {
           priceRanges["0-100"]++;
       } else if (price >= 101 && price <= 200) {
           priceRanges["101-200"]++;
       } else if (price >= 201 && price <= 300) {
           priceRanges["201-300"]++;
       } else if (price >= 301 && price <= 400) {
           priceRanges["301-400"]++;
       } else if (price >= 401 && price <= 500) {
           priceRanges["401-500"]++;
       } else if (price >= 501 && price <= 600) {
           priceRanges["501-600"]++;
       } else if (price >= 601 && price <= 700) {
           priceRanges["601-700"]++;
       } else if (price >= 701 && price <= 800) {
           priceRanges["701-800"]++;
       } else if (price >= 801 && price <= 900) {
           priceRanges["801-900"]++;
       } else {
           priceRanges["901-above"]++;
       }
   });

   // Send the price range statistics as a response
   res.status(200).json(priceRanges);
});

const getCategoryStatistics = asyncHandler(async (req, res) => {
   const { month } = req.params;
   const selectedMonth = parseInt(month, 10); // Convert month to an integer

   // Validate that the month is between 1 and 12
   if (selectedMonth < 1 || selectedMonth > 12) {
       return res.status(400).json({ message: 'Invalid month. Please provide a value between 1 and 12.' });
   }

   // Find all items sold in the selected month, regardless of the year
   const products = await Product.find({
       $expr: { $eq: [{ $month: "$dateOfSale" }, selectedMonth] }
   });

   // Initialize a map to hold category counts
   const categoryCounts = {};

   // Iterate over the products and classify them by category
   products.forEach(product => {
       const category = product.category;

       if (categoryCounts[category]) {
           categoryCounts[category]++;
       } else {
           categoryCounts[category] = 1;
       }
   });

   // Convert the categoryCounts object to an array format (for better readability, if needed)
   const result = Object.keys(categoryCounts).map(category => ({
       category,
       count: categoryCounts[category]
   }));

   // Send the category statistics as a response
   res.status(200).json(result);
});


const getCombinedStatistics = asyncHandler(async (req, res) => {
   const { month } = req.params;
   const selectedMonth = parseInt(month, 10); // Convert month to an integer

   // Validate that the month is between 1 and 12
   if (selectedMonth < 1 || selectedMonth > 12) {
       return res.status(400).json({ message: 'Invalid month. Please provide a value between 1 and 12.' });
   }

   try {
       // Assuming the three API endpoints are:
       const monthVizeProductsUrl= `http://localhost:5000/api/products/${selectedMonth}`;
       const monthlyStatisticsUrl = `http://localhost:5000/api/products/statistics/${selectedMonth}`;
       const priceRangeStatisticsUrl = `http://localhost:5000/api/products/price-range/${selectedMonth}`;
       const categoryStatisticsUrl = `http://localhost:5000/api/products/category-statistics/${selectedMonth}`;

       // Use Promise.all to make concurrent requests to all three APIs
       const [monthVizeProductsResponse, monthlyStatisticsResponse, priceRangeResponse, categoryStatisticsResponse] = await Promise.all([
           axios.get(monthVizeProductsUrl),
           axios.get(monthlyStatisticsUrl),
           axios.get(priceRangeStatisticsUrl),
           axios.get(categoryStatisticsUrl)
       ]);

       // Extract the data from the responses
       const monthVizeProducts= monthVizeProductsResponse.data;
       const monthlyStatistics = monthlyStatisticsResponse.data;
       const priceRangeStatistics = priceRangeResponse.data;
       const categoryStatistics = categoryStatisticsResponse.data;

       // Combine all the results into a single object
       const combinedResponse = {
           monthVizeProducts,
           monthlyStatistics,
           priceRangeStatistics,
           categoryStatistics
       };

       // Send the combined response
       res.status(200).json(combinedResponse);
   } catch (error) {
       console.error('Error fetching combined statistics:', error);
       res.status(500).json({ message: 'Error fetching combined statistics', error });
   }
});


 export {
   getProducts,
   getSearchProducts,
   getMonthlyStatistics,
   getPriceRangeStatistics,
   getCategoryStatistics,
   getCombinedStatistics
};