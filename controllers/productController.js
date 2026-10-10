const Product = require("../models/Product");

// Create product
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// Get all products (filter, sort, paginate)
exports.getProducts = async (req, res, next) => {
  try {
    const { category, sortBy, page = 1, limit = 10 } = req.query;
    const query = category ? { category } : {};

    const products = await Product.find(query)
      .sort(sortBy ? { [sortBy]: 1 } : {})
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(products);
  } catch (error) {
    next(error);
  }
};

// Get single product
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Update product / stock
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

// Low-stock report
exports.lowStockReport = async (req, res, next) => {
  try {
    const threshold = req.query.threshold || 5;
    const report = await Product.find({ stock: { $lt: threshold } });
    res.json(report);
  } catch (error) {
    next(error);
  }
};

// Category summary (aggregation)
exports.categorySummary = async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalStock: { $sum: "$stock" },
          avgPrice: { $avg: "$price" }
        }
      }
    ]);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};
