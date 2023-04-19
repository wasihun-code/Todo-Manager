'use strict'
const { Model, Op } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }

    static addTodo ({ title, dueDate }) {
      return this.create({ title, dueDate, completed: false })
    }

    static getAllTodos () {
      return this.findAll()
    }

    static getOverdueTodos () {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date()
          }
        }
      })
    }

    static getTodayTodos () {
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date()
          }
        }
      })
    }

    static getDueLaterTodos () {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date()
          }
        }
      })
    }

    static async remove (id) {
      return this.destroy({
        where: {
          id
        }
      })
    }

    markAsCompleted () {
      return this.update({ completed: true })
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'Todo'
    }
  )
  return Todo
}
