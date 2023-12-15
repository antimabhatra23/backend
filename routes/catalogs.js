const express = require('express');
const router = express.Router();
const { Catalog } = require('../models/catalog');

router.get(`/`, async (req, res) => {
    const catalogList = await Catalog.find();
    if (!catalogList) {
        res.status(500).json({ success: false })
    }
    res.status(200).send(catalogList);
});

router.get('/buyer/seller-catalog/:seller_id', async (req, res) => {
    const catalog = await Catalog.findById(req.params.seller_id);

    if (!catalog) {
        res.status(500).json({ message: "The catalog with the given seller ID was not found" });
    }
    res.status(200).send(catalog);
});


router.post('/seller/create-catalog', async (req, res) => {

    let catalog = new Catalog({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })

    catalog = await catalog.save();

    if (!catalog) {
        res.status(500).send("The catalog can't be created")
    }

    res.send(catalog);
})

router.put('/:id', async (req, res) => {
    const catalog = await Catalog.findByIdAndUpdate(
        req.params.id,
        
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },

        { new: true }
    )

    if (!catalog) {
        res.status(500).send("The catalog can't be created")
    }

    res.send(catalog);
})

router.delete('/:id', (req, res) => {
    Catalog.findByIdAndDelete(req.params.id).then((catalog => {
        if (catalog) {
            return res.status(200).json({ success: true, message: "The catalog is deleted" })
        }
        else {
            res.status(404).json({ success: false, message: "The catalog is not deleted" });
        }
    })).catch((err) => {
        res.status(400).json(err.message);
    })
})

module.exports = router;