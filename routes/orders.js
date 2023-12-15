const express = require('express');
const router = express.Router();
const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-items');

router.get(`/seller/orders`, async (req, res) => {

    const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 });

    if (!orderList) {
        res.status(500).json({ success: false })
    }

    res.send(orderList);
});

router.get(`/:id`, async (req, res) => {

    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems',
            populate: { path: 'product', populate: 'catalog' }
        });

    if (!order) {
        res.status(500).json({ success: false })
    }

    res.send(order);
});

router.post('/buyer/create-order/:seller_id', async (req, res) => {

    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))

    const orderItemIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }))

    const totalPrice = totalPrices.reduce((acc, price) => acc + price, 0);

    let order = new Order({
        orderItems: orderItemIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user
    })

    order = await order.save();

    if (!order) {
        res.status(500).send("The order can't be created")
    }

    res.send(order);
});


router.put('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            },
            { new: true }
        );

        if (!order) {
            return res.status(500).send("The order can't be updated");
        }

        res.send(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndDelete(orderItem);
            })
            return res.status(200).json({ success: true, message: "The order is deleted" });
        } else {
            return res.status(404).json({ success: false, message: "The order is not found" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
    ])

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated');
    }

    res.send({ totalsales: totalSales.pop().totalsales });
});

router.get(`/get/count`, async (req, res) => {
    try {
        const ordertCount = await Order.countDocuments();
        if (ordertCount === undefined || ordertCount === null) {
            res.status(500).json({ success: false });
        } else {
            res.send({ count: ordertCount });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get(`/get/userorders/:userid`, async (req, res) => {

    const userOrderList = await Order.find({ user: req.params.userid })
        .populate({
            path: 'orderItems',
            populate: { path: 'product', populate: 'catalog' }
        })
        .sort({ 'dateOrdered': -1 });

    if (!userOrderList) {
        res.status(500).json({ success: false })
    }

    res.send(userOrderList);
});

module.exports = router;

