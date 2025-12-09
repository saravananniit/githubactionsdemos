const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { protect, authorize } = require('../middleware/auth');
const {
  validateTaskCreate,
  validateTaskUpdate,
} = require('../utils/validation');

// All task routes require authentication
router.use(protect);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (user's own tasks, or all tasks if admin)
 * @access  Private
 */
router.get('/', taskController.getAllTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
router.get('/:id', taskController.getTaskById);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', validateTaskCreate, taskController.createTask);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', validateTaskUpdate, taskController.updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', taskController.deleteTask);

module.exports = router;
