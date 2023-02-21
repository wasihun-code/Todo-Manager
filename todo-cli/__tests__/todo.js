/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-undef */
const { todoList } = require("../todo");

// eslint-disable-next-line no-unused-vars
const { all, add, markAsComplete, overdue, dueToday, dueLater } = todoList();

describe("TODOLIST Test Suite", () => {
  beforeAll(() => {
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

    add({ title: "Submit assignment", dueDate: yesterday, completed: false });
    add({ title: "Pay rent", dueDate: today, completed: true });
    add({ title: "Service Vehicle", dueDate: today, completed: false });
    add({ title: "File taxes", dueDate: tomorrow, completed: false });
    add({ title: "Pay electric bill", dueDate: tomorrow, completed: false });
  });
  test("Test Length", () => {
    expect(all.length).toBe(5);
  });
  test("Test Adding", () => {
    const newTodoObject = { title: "Review Academical", completed: true };
    add(newTodoObject);
    expect(all.length).toBe(6);
    expect(all[all.length - 1].title).toBe("Review Academical");
  });
  test("Test Overdue Items", () => {
    expect(overdue().length).toBe(1);
  });
  test("Test Due today Items", () => {
    expect(dueToday().length).toBe(2);
  });
  test("Test Due Later Items", () => {
    expect(dueLater().length).toBe(2);
  });
  test("Test Marking a test complete", () => {
    const index = 0;
    markAsComplete(index);
    expect(all[index].completed).toBe(true);
  });
});
