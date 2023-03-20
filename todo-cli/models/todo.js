/* eslint-disable no-var */
'use strict'
// eslint-disable-next-line no-unused-vars
var argv = require('minimist')(process.argv)

const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static formattedDate = (d) => {
      return d.toISOString().split('T')[0]
    }

    static async addTask (params) {
      try {
        return await Todo.create({
          title: params.title,
          dueDate: params.dueDate.toISOString(),
          completed: params.completed
        })
      } catch (error) {
        console.log(error)
      }
    }

    static associate (models) {
      // define association here
    }

    static logTasks (todos) {
      const todosString = todos
        .map((todo) => todo.displayableString())
        .join('\n')
        .trim()
      console.log(todosString)
    }

    static showList = async () => {
      console.log('My Todo-list\n')

      console.log('Overdue')
      Todo.logTasks(await Todo.overdue())

      console.log('\nDue Today')
      Todo.logTasks(await Todo.dueToday())

      console.log('\nDue Later')
      Todo.logTasks(await Todo.dueLater())
    }

    static async overdue () {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      try {
        const allTodos = await Todo.findAll()
        const dueToday = allTodos.filter(
          (todo) => todo.dueDate < Todo.formattedDate(new Date())
        )
        return dueToday
      } catch (error) {
        console.log(error)
      }
    }

    static async dueToday () {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      try {
        const allTodos = await Todo.findAll()
        const dueToday = allTodos.filter(
          (todo) => todo.dueDate === Todo.formattedDate(new Date())
        )
        return dueToday
      } catch (error) {
        console.log(error)
      }
    }

    static async dueLater () {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      try {
        const allTodos = await Todo.findAll()
        const dueToday = allTodos.filter(
          (todo) => todo.dueDate > Todo.formattedDate(new Date())
        )
        return dueToday
      } catch (error) {
        console.log(error)
      }
    }

    static async markAsComplete (id) {
      // FILL IN HERE TO MARK AN ITEM AS COMPLETE
      try {
        await Todo.update(
          {
            completed: true
          },
          {
            where: {
              id
            }
          }
        )
      } catch (error) {
        console.log(error)
      }
    }

    displayableString () {
      const checkbox = this.completed ? '[x]' : '[ ]'
      return `${this.id}. ${checkbox} ${this.title} ${
        this.dueDate === new Date().toISOString().split('T')[0]
          ? ''
          : this.dueDate
      }`.trim()
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
