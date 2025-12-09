const axios = require('axios');
const config = require('../config/config');

/**
 * Database service - Axios client for JSON Server CRUD operations
 */
class DbService {
  constructor() {
    this.baseURL = config.db.url;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get all records from a resource
   * @param {string} resource - Resource name (e.g., 'users', 'tasks')
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Array of records
   */
  async findAll(resource, params = {}) {
    try {
      const response = await this.client.get(`/${resource}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch ${resource}: ${error.message}`);
    }
  }

  /**
   * Get a single record by ID
   * @param {string} resource - Resource name
   * @param {string|number} id - Record ID
   * @returns {Promise<Object>} Record object
   */
  async findById(resource, id) {
    try {
      const response = await this.client.get(`/${resource}/${id}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch ${resource} with id ${id}: ${error.message}`);
    }
  }

  /**
   * Find a record by a specific field
   * @param {string} resource - Resource name
   * @param {string} field - Field name to search by
   * @param {*} value - Value to search for
   * @returns {Promise<Object|null>} Record object or null
   */
  async findByField(resource, field, value) {
    try {
      const response = await this.client.get(`/${resource}?${field}=${value}`);
      const records = response.data;
      return Array.isArray(records) && records.length > 0 ? records[0] : null;
    } catch (error) {
      throw new Error(
        `Failed to find ${resource} by ${field}: ${error.message}`
      );
    }
  }

  /**
   * Create a new record
   * @param {string} resource - Resource name
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async create(resource, data) {
    try {
      const response = await this.client.post(`/${resource}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create ${resource}: ${error.message}`);
    }
  }

  /**
   * Update a record by ID
   * @param {string} resource - Resource name
   * @param {string|number} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   */
  async update(resource, id, data) {
    try {
      const response = await this.client.put(`/${resource}/${id}`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new Error(`Failed to update ${resource} with id ${id}: ${error.message}`);
    }
  }

  /**
   * Partially update a record by ID (PATCH)
   * @param {string} resource - Resource name
   * @param {string|number} id - Record ID
   * @param {Object} data - Partial data to update
   * @returns {Promise<Object>} Updated record
   */
  async patch(resource, id, data) {
    try {
      const response = await this.client.patch(`/${resource}/${id}`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new Error(`Failed to patch ${resource} with id ${id}: ${error.message}`);
    }
  }

  /**
   * Delete a record by ID
   * @param {string} resource - Resource name
   * @param {string|number} id - Record ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(resource, id) {
    try {
      await this.client.delete(`/${resource}/${id}`);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      throw new Error(`Failed to delete ${resource} with id ${id}: ${error.message}`);
    }
  }
}

module.exports = new DbService();
