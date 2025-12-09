const taskService = require('../services/task.service');

/**
 * Get all tasks file modified.
 */
const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks(req.user.userId, req.user.role);
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single task by ID
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(
      parseInt(req.params.id),
      req.user.userId,
      req.user.role
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error.message === 'Not authorized to access this task') {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Create a new task
 */
const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user.userId);
    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      parseInt(req.params.id),
      req.body,
      req.user.userId,
      req.user.role
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error.message === 'Not authorized to access this task') {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Delete a task
 */
const deleteTask = async (req, res, next) => {
  try {
    const deleted = await taskService.deleteTask(
      parseInt(req.params.id),
      req.user.userId,
      req.user.role
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    if (error.message === 'Not authorized to access this task') {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
