const Order = require('../models/orderModel');
const ErrorHandler = require('../util/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const Product = require('../models/productModel');

// create order

exports.createNewOrder = catchAsyncError(async (req, res, next) => {
    const {
        shippingInfo,
        orderitems,
        paymmnetInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body

    const order = await Order.create({
        shippingInfo,
        orderitems,
        paymmnetInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    res.status(201).json({
        success: true,
        order,
    })
})

// get single order

exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        return next(new ErrorHandler('order not found with this id', 404));

    }
    res.status(201).json({
        success: true,
        order,
    })
})

// get logged in user

exports.myOrder = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })

    if (!orders) {
        return next(new ErrorHandler('order not found with this id', 404));

    }
    res.status(201).json({
        success: true,
        orders,
    })
})

// get all orders -- admin

exports.getAllOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find()

    let toatalAmount = 0;

    orders.forEach((order) => {

        toatalAmount += order.totalPrice;
    })

    if (!orders) {
        return next(new ErrorHandler('order not found with this id', 404));

    }
    res.status(201).json({
        success: true,
        toatalAmount,
        orders,
    })
})


// update order status --Admin
exports.updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    console.log(order);



    if (!order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('you have already deliver product', 404));

    }

    order.orderitems.forEach(async (order) => {
        console.log(order);
        await updateStock(order.product, order.quantity)
    })

    order.orderStatus = req.body.status;

    if (req.body.status === 'delivered') {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false })
    res.status(201).json({
        success: true,

        order,
    })
})

async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.stock = product.stock - quantity

    await product.save({ validateBeforeSave: false })
}

exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    await order.remove();

    res.status(200).json({
        success: true,
    });
});
