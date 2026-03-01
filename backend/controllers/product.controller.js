import Product from "../models/Product.js";

/* -------------------------------------------------------------------------- */
/*                              CREATE PRODUCT                                 */
/* -------------------------------------------------------------------------- */
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                               GET PRODUCTS                                  */
/* -------------------------------------------------------------------------- */
export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const query = search
      ? { productName: { $regex: search, $options: "i" } }
      : {};

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      data: products,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                              UPDATE PRODUCT                                 */
/* -------------------------------------------------------------------------- */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user.id,
      },
      { new: true, runValidators: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                              DELETE PRODUCT                                 */
/* -------------------------------------------------------------------------- */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
