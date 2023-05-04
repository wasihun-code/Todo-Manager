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

    static addTodo ({ title, dueDate, userId }) {
      return this.create({ title, dueDate, completed: false, userId })
    }

    static getAllTodos () {
      return this.findAll()
    }

    static getOverdueTodos (userId) {
      return this.findAll({
        where: {
          completed: false,
          dueDate: {
            [Op.lt]: new Date()
          },
          userId
        }
      })
    }

    static getTodayTodos (userId) {
      return this.findAll({
        where: {
          completed: false,
          userId,
          dueDate: {
            [Op.eq]: new Date()
          }
        }
      })
    }

    static getDueLaterTodos (userId) {
      return this.findAll({
        where: {
          completed: false,
          userId,
          dueDate: {
            [Op.gt]: new Date()
          }
        }
      })
    }

    static getCompletedTodos (userId) {
      return this.findAll({
        where: {
          completed: true,
          userId
        }
      })
    }

    static async remove (id, userId) {
      return this.destroy({
        where: {
          id,
          userId
        }
      })
    }

    setCompletionStatus (status) {
      return this.update({ completed: status })
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true
        }
      },
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
