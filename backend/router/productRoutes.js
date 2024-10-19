import express from 'express';
import { getProducts,
    getMonthlyStatistics,
    getPriceRangeStatistics,
    getCategoryStatistics,
    getCombinedStatistics,
    getSearchProducts
 }from '../controllers/productControllers.js';



const router = express.Router();

router.route('/:month').get(getProducts);
router.route('').get(getSearchProducts);
router.route('/statistics/:month').get(getMonthlyStatistics);
router.route('/price-range/:month').get(getPriceRangeStatistics);
router.route('/category-statistics/:month').get(getCategoryStatistics);
router.route('/combined-statistics/:month').get(getCombinedStatistics);




export default router;