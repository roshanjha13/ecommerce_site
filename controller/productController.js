const Product = require('../models/productModel');
const ErrorHandler = require('../util/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const ApiFeatures = require('../util/apiFeatures');

//create product , this is admin route
exports.createProduct = catchAsyncError(async (req, res, next) => {

    req.body.user = req.user.id;

    const products = await Product.create(req.body);

    res.status(201).json({
        success: true,
        products
    })
})

// get all product
exports.getAllProducts = catchAsyncError(async (req, res) => {
    console.log(req.user);
    const resultPerPage = 5;
    const productCount = await Product.countDocuments()
    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage)
    const products = await apiFeature.query;

    res.status(200).json({
        success: true,
        products,
        productCount
    })
})

// get product detailes

exports.getProductsDetails = catchAsyncError(async (req, res, next) => {
    let products = await Product.findById(req.params.id);
    if (!products) {
        return next(new ErrorHandler("product not found", 404))
    }

    res.status(200).json({
        success: true,
        products
    })
})

//update products-- Admin routes

exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let products = await Product.findById(req.params.id)
    if (!products) {
        return next(new ErrorHandler("product not found", 404))
    }
    products = await Product.findByIdAndUpdate(
        req.params.id, req.body,
        {
            new: true,
            runvalidators: true,
            useFindAndModify: false
        }
    );
    res.status(200).json({
        success: true,
        products
    })

})

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
    let products = await Product.findById(req.params.id);
    if (!products) {
        return next(new ErrorHandler("product not found", 404))
    }

    products = await Product.remove()
    res.status(200).json({
        success: true,
        message: 'product delete successfully'
    })

})

// create new review  

exports.createProductReview = catchAsyncError(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    // find product which are user reviewed

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        rev => rev.user.toString() === req.user._id.toString()
    )
    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating),
                    (rev.comment = comment)
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;

    }
    //update rating
    let avg = 0

    // for avg of rating

    product.reviews.forEach(rev => {
        avg += rev.rating;
    })

    product.ratings = (avg / product.reviews.length);

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
    });
});

// get all reviews of single product

exports.getProductReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler('product are not found', 404));

    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    })
})

exports.deleteReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler('product are not found', 404));

    }

    // here we delete review which are not want
    const reviews = product.reviews.filter(
        rev => rev._id.toString() !== req.query.id.toString()
    )

    let avg = 0

    // for avg of rating

    reviews.forEach(rev => {
        avg += rev.rating;
    })

    const ratings = (avg / reviews.length);

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId,
        {
            reviews, ratings, numOfReviews
        },
        {
            new: true, runvalidators: true, useFindAndModify: false
        }
    )

    res.status(200).json({
        success: true,
    })

})