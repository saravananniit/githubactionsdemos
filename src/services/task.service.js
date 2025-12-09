const dbService = require('./db.service');

/**
 * Task service
 */
class TaskService {
  /**
   * Get all tasks for a user
   * @param {number} userId - User ID
   * @param {string} role - User role
   * @returns {Promise<Array>} Array of tasks
   */
  async getAllTasks(userId, role) {
    if (role === 'admin') {
      // Admins can see all tasks
      return await dbService.findAll('tasks');
    }
    // Regular users can only see their own tasks
    return await dbService.findAll('tasks', { userId });
  }

  /**
   * Get a single task by ID
   * @param {number} taskId - Task ID
   * @param {number} userId - User ID
   * @param {string} role - User role
   * @returns {Promise<Object|null>} Task object or null
   */
  async getTaskById(taskId, userId, role) {
    const task = await dbService.findById('tasks', taskId);
    if (!task) {
      return null;
    }

    // Check authorization: admin can access any task, user can only access their own
    if (role !== 'admin' && task.userId !== userId) {
      throw new Error('Not authorized to access this task');
    }

    return task;
  }

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData, userId) {
    const { title, description = '', status = 'pending' } = taskData;

    const task = await dbService.create('tasks', {
      title,
      description,
      status,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return task;
  }

  /**
   * Update a task
   * @param {number} taskId - Task ID
   * @param {Object} taskData - Updated task data
   * @param {number} userId - User ID
   * @param {string} role - User role
   * @returns {Promise<Object|null>} Updated task or null
   */
  async updateTask(taskId, taskData, userId, role) {
    // First, check if task exists and user has permission
    const existingTask = await this.getTaskById(taskId, userId, role);
    if (!existingTask) {
      return null;
    }

    // Update task
    const updatedTask = await dbService.update('tasks', taskId, {
      ...existingTask,
      ...taskData,
      updatedAt: new Date().toISOString(),
    });

    return updatedTask;
  }

  /**
   * Delete a task
   * @param {number} taskId - Task ID
   * @param {number} userId - User ID
   * @param {string} role - User role
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteTask(taskId, userId, role) {
    // First, check if task exists and user has permission
    const existingTask = await this.getTaskById(taskId, userId, role);
    if (!existingTask) {
      return false;
    }

    return await dbService.delete('tasks', taskId);
  }
}

module.exports = new TaskService();
