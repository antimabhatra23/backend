const express = require('express');
const router = express.Router();
const { Product } = require('../models/product');
const { Catalog } = require('../models/catalog');
const mongoose = require('mongoose');

router.get(`/`, async (req, res) => {
    //localhost:3000/api/v1/products?catalog(query param)=2342342,2342342
    let filter = {};
    if (req.query.catalog) {
        filter = { catalog: req.query.catalog.split(',') };
    }
    const productList = await Product.find(filter).populate('catalog');
    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList);
});

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('catalog');
    if (!product) {
        res.status(500).json({ success: false })
    }
    res.send(product);
});

router.post(`/`, async (req, res) => {
    try {
        const catalog = await Catalog.findById(req.body.catalog);
        if (!catalog) {
            return res.status(400).send("Invalid catalog");
        }

        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            brand: req.body.brand,
            price: req.body.price,
            product: req.body.product,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        });

        product = await product.save();

        if (!product) {
            return res.status(500).send("The product can't be created");
        }

        res.send(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            res.status(400).send("Invalid Product Id");
        }
        const catalog = await Catalog.findById(req.body.catalog);
        if (!catalog) {
            return res.status(400).send("Invalid catalog");
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                richDescription: req.body.richDescription,
                image: req.body.image,
                brand: req.body.brand,
                price: req.body.price,
                product: req.body.product,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                numReviews: req.body.numReviews,
                isFeatured: req.body.isFeatured
            },
            { new: true }
        );

        if (!product) {
            return res.status(500).send("The product can't be updated");
        }

        res.send(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send("Invalid Product Id");
        }

        const product = await Product.findByIdAndDelete(req.params.id);
        if (product) {
            return res.status(200).json({ success: true, message: "The product is deleted" });
        } else {
            return res.status(404).json({ success: false, message: "The product is not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get(`/get/count`, async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        if (productCount === undefined || productCount === null) {
            res.status(500).json({ success: false });
        } else {
            res.send({ count: productCount });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get(`/get/featured/:count`, async (req, res) => {
    try {
        const count = req.params.count ? req.params.count : 0;
        const products = await Product.find({ isFeatured: true }).limit(+count);
        if (products === undefined || products === null) {
            res.status(500).json({ success: false });
        } else {
            res.send(products);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;