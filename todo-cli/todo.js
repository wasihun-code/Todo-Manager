/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable no-undef */
const todoList = () => {
  all = [];
  const add = (todoItem) => {
    all.push(todoItem);
  };
  const markAsComplete = (index) => {
    all[index].completed = true;
  };

  const overdue = () => {
    return all.filter((todo) => todo.dueDate < today);
  };

  const dueToday = () => {
    return all.filter((todo) => todo.dueDate === today);
  };

  const dueLater = () => {
    return all.filter((todo) => todo.dueDate > today);
  };

  const toDisplayableList = (list) => {
    let outputString = "";
    for (todo of list) {
      todo.completed ? (outputString += "[x] ") : (outputString += "[ ] ");
      todo.dueDate === today
        ? (outputString += `${todo.title}\n`)
        : (outputString += `${todo.title} ${todo.dueDate}\n`);
    }
    return outputString.trim();
  };

  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    // eslint-disable-next-line comma-dangle
    toDisplayableList,
  };
};

// ####################################### #
// DO NOT CHANGE ANYTHING BELOW THIS LINE. #
// ####################################### #

const todos = todoList();

const formattedDate = (d) => {
  return d.toISOString().split("T")[0];
};

const dateToday = new Date();
const today = formattedDate(dateToday);
const yesterday = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() - 1))
);
const tomorrow = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() + 1))
);

todos.add({ title: "Submit assignment", dueDate: yesterday, completed: false });
todos.add({ title: "Pay rent", dueDate: today, completed: true });
todos.add({ title: "Service Vehicle", dueDate: today, completed: false });
todos.add({ title: "File taxes", dueDate: tomorrow, completed: false });
todos.add({ title: "Pay electric bill", dueDate: tomorrow, completed: false });

// console.log('My Todo-list\n')

// console.log('Overdue')
// const overdues = todos.overdue()
// const formattedOverdues = todos.toDisplayableList(overdues)
// console.log(formattedOverdues)
// console.log('\n')

// console.log('Due Today')
// const itemsDueToday = todos.dueToday()
// const formattedItemsDueToday = todos.toDisplayableList(itemsDueToday)
// console.log(formattedItemsDueToday)
// console.log('\n')

// console.log('Due Later')
// const itemsDueLater = todos.dueLater()
// const formattedItemsDueLater = todos.toDisplayableList(itemsDueLater)
// console.log(formattedItemsDueLater)
// console.log('\n\n')

module.exports = { todoList };
