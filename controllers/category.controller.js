const { Category, Todo } = require("../models");
const sendResponse = require("../utils/response");

// GET /categories -> ambil semua category milik user yg login
async function getCategories(req, res) {
  try {
    const categories = await Category.findAll({
      where: { user_id: req.session.userId },
      order: [["createdAt", "DESC"]],
    });

    return sendResponse(res, {
      message: "Berhasil ambil category",
      data: categories,
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// POST /categories -> tambah category baru
async function addCategory(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return sendResponse(res, {
        code: 400,
        success: false,
        message: "name wajib diisi",
      });
    }

    const category = await Category.create({
      name,
      user_id: req.session.userId,
    });

    return sendResponse(res, {
      code: 201,
      message: "Category berhasil ditambahkan",
      data: category,
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// PUT /categories/:id -> update category (name)
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findOne({
      where: { id, user_id: req.session.userId },
    });
    if (!category) {
      return sendResponse(res, {
        code: 404,
        success: false,
        message: "Category tidak ditemukan",
      });
    }

    if (name !== undefined) category.name = name;
    await category.save();

    return sendResponse(res, {
      message: "Category berhasil diupdate",
      data: category,
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// DELETE /categories/:id
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, user_id: req.session.userId },
    });
    if (!category) {
      return sendResponse(res, {
        code: 404,
        success: false,
        message: "Category tidak ditemukan",
      });
    }

    // lepas relasi todo yang pakai category ini (biar gak nyangkut FK)
    await Todo.update(
      { category_id: null },
      { where: { category_id: id, user_id: req.session.userId } },
    );

    await category.destroy();

    return sendResponse(res, { message: "Category berhasil dihapus" });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

module.exports = {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
};
