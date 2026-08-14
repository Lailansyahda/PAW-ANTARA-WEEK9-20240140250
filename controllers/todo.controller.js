const { Todo, Category } = require("../models");
const sendResponse = require("../utils/response");

// GET /todos -> ambil semua todo milik user yg login
async function getTodos(req, res) {
  try {
    const todos = await Todo.findAll({
      where: { user_id: req.session.userId },
      order: [["createdAt", "DESC"]],
    });

    return sendResponse(res, { message: "Berhasil ambil todo", data: todos });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// POST /todos -> tambah todo baru
async function addTodo(req, res) {
  try {
    const { title, category_id } = req.body;

    if (!title) {
      return sendResponse(res, {
        code: 400,
        success: false,
        message: "title wajib diisi",
      });
    }

    // category_id opsional, tapi kalau dikirim harus valid & milik user ini
    if (category_id !== undefined && category_id !== null) {
      const category = await Category.findOne({
        where: { id: category_id, user_id: req.session.userId },
      });
      if (!category) {
        return sendResponse(res, {
          code: 404,
          success: false,
          message: "Category tidak ditemukan",
        });
      }
    }

    const todo = await Todo.create({
      title,
      user_id: req.session.userId,
      category_id: category_id || null,
    });

    return sendResponse(res, {
      code: 201,
      message: "Todo berhasil ditambahkan",
      data: todo,
    });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// PUT /todos/:id -> update todo (title / is_done / category_id)
async function updateTodo(req, res) {
  try {
    const { id } = req.params;
    const { title, is_done, category_id } = req.body;

    const todo = await Todo.findOne({
      where: { id, user_id: req.session.userId },
    });
    if (!todo) {
      return sendResponse(res, {
        code: 404,
        success: false,
        message: "Todo tidak ditemukan",
      });
    }

    // kalau category_id dikirim (bukan undefined), validasi dulu category-nya
    // benar milik user yang sama, biar gak nyantol ke category orang lain
    if (category_id !== undefined) {
      if (category_id === null) {
        todo.category_id = null;
      } else {
        const category = await Category.findOne({
          where: { id: category_id, user_id: req.session.userId },
        });
        if (!category) {
          return sendResponse(res, {
            code: 404,
            success: false,
            message: "Category tidak ditemukan",
          });
        }
        todo.category_id = category_id;
      }
    }

    if (title !== undefined) todo.title = title;
    if (is_done !== undefined) todo.is_done = is_done;
    await todo.save();

    return sendResponse(res, { message: "Todo berhasil diupdate", data: todo });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

// DELETE /todos/:id
async function deleteTodo(req, res) {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({
      where: { id, user_id: req.session.userId },
    });
    if (!todo) {
      return sendResponse(res, {
        code: 404,
        success: false,
        message: "Todo tidak ditemukan",
      });
    }

    await todo.destroy();

    return sendResponse(res, { message: "Todo berhasil dihapus" });
  } catch (err) {
    return sendResponse(res, {
      code: 500,
      success: false,
      message: err.message,
    });
  }
}

module.exports = { getTodos, addTodo, updateTodo, deleteTodo };
