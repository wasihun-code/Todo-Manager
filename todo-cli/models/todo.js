'use strict';
var argv = require('minimist')(process.argv);

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
        try {
            return await Todo.create({
                title: params.title,
                dueDate: params.dueInDays,
                completed: params.completed
            })
        } 
        catch (error) {
            console.log(error)
        }
    }

    static associate(models) {
      // define association here
    }

    static showList = async () => {
        const todos = await Todo.findAll();
        const outputString = todos.map(todo => todo.displayableString().join("\n"))
        console.log(outputString.trim())
    }

    static async overdue() {
        // FILL IN HERE TO RETURN OVERDUE ITEMS
        return await Todo.findAll({
            where: {
                dueDate:{
                    $gt: new Date()
                }
            }
        })
        
      }
  
      static async dueToday() {
        // FILL IN HERE TO RETURN ITEMS DUE tODAY
        try {
            return await Todo.findAll({
                where: {
                    dueDate: {
                        $eq: new Date()
                    }
                }
            })
        } catch (error) {
            console.log(error)
        }        
      }
  
      static async dueLater() {
        // FILL IN HERE TO RETURN ITEMS DUE LATER
        try {
              return  await Todo.findAll({
                where: {
                    dueDate: {
                        $lt: new Date()
                    }
                }
            })
        } catch (error) {
            console.log(error)
        }
        
      }
  
      static async markAsComplete(id) {
        // FILL IN HERE TO MARK AN ITEM AS COMPLETE
        try {
            await Todo.update({completed: true}, {
                where: {
                    id: id
                }
            })
        } catch(error) {
            console.log(error);
        } 
      }
  
      displayableString() {
        let checkbox = this.completed ? "[x]" : "[ ]";
        return `${this.id}. ${checkbox} ${this.title} ${this.dueDate === new Date() ? this.dueDate : ''}`;
      }
  }
  Todo.init({
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};
