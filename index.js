const mysql = require("mysql");
const inquirer = require("inquirer");

require("console.table");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employee_db"
});

connection.connect(function (err) {
    if (err) throw err;

    start();
});

function start() {
    inquirer
        .prompt([{
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View All Employees",
                "View All Departments",
                "View All Roles",
                "Add Employee",
                "Add Department",
                "Add Role",
                "Update Employee Role",
                "Exit"
            ]
        }])
        .then(function (input) {
            switch (input.action) {
                case "View All Employees":
                    viewAll();
                    break;
                case "View All Departments":
                    viewDept();
                    break;
                case "View All Roles":
                    viewRole();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Add Department":
                    addDept();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "Update Employee Role":
                    updateRole();
                    break;
                case "Exit":
                    connection.end();
            }
        });
}

// view all emploees
function viewAll(){
connection.query(
    'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, ' +
    'role.salary, concat(employee2.first_name, " ", employee2.last_name) manager ' +
    'FROM employee ' +
    'left join employee employee2 on employee.manager_id = employee2.id ' +
    'left join role on employee.role_id = role.role_id ' +
    'left join department on role.department_id = department.department_id ' +
    'Order By employee.id',

    function(err, res) {
    if (err) throw err;
    console.table(res);
    questionsPrompt();
  });
}
// view department
function viewDept() {
    connection.query("SELECT Name FROM department", function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
    });
}
// view role
function viewRole() {
    connection.query("SELECT Title FROM role", function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
    });
}
// Add employee
function roleChoice() {
    return new Promise((resolve, reject) => {
        connection.query("Select Title FROM role", function (err, data) {
            if (err) throw err;
            resolve(data);
        });
    });
}

function managerChoice() {
    return new Promise((resolve, reject) => {
        connection.query(
            `Select id, concat(employee.First_Name," ", employee.Last_Name) manager FROM employee`,
            function (err, data) {
                if (err) throw err;
                resolve(data);
            }
        );
    });
}
function lookUpId(tableName, columnName, value) {
    return new Promise((resolve, reject) => {
        let statement = connection.query(
            `Select Id FROM ${tableName} WHERE ${columnName} = '${value}'`,
            function (err, data) {
                if (err) throw err;
                resolve(data);
            }
        );
    });
}

function addEmployee() {
    let titleList = [];
    let managerList = []; 


    roleChoice().then(function (titles) {
        titleList = titles.map(role => role.Title);
        managerChoice().then(function (managers) {
            managerList = managers.map(manager => manager.manager);

            inquirer.prompt([{
                        name: "firstName",
                        type: "input",
                        message: "What is the employee's first name?"
                    },
                    {
                        name: "lastName",
                        type: "input",
                        message: "What is the employee's last name?"
                    },
                    {
                        name: "role",
                        type: "list",
                        message: "What is the employee's role?",
                        choices: titleList
                    },
                    {
                        name: "manager",
                        type: "list",
                        message: "Who is the employee's manager?",
                        choices: managerList
                    }
                ])
                .then(function (input) {
                    const selectedManager = managers.find(item => item.manager === input.manager);
                    lookUpId("role", "title", input.role).then(function (titleData) {
                        
                        lookUpId("employee", "concat(First_Name, ' ', Last_Name)", input.manager).then(function (managerData) {

                            connection.query(`INSERT INTO employee (First_Name, Last_Name, Role_Id, Manager_Id) VALUES("${input.firstName}", "${input.lastName}", ${titleData[0].Id}, ${selectedManager.id})`,

                                function (err, res) {
                                    if (err) throw err;

                                    console.log(viewEmployees())
                                    start();
                                }
                            );
                        });
                    });
                });
        })
    })
}
// add dept
function addDept() {
    inquirer.prompt([{
            name: "department",
            type: "input",
            message: "What department would you like to add?"
        }])
        .then(function (input) {
            connection.query(`INSERT INTO department (name) VALUES("${input.department}")`, function (err, res) {
                if (err) throw err;
                console.table(viewDept());
                start();
            });
        });
}
// add role
function deptChoice() {
    return new Promise((resolve, reject) => {
        connection.query("Select id, name FROM department", function (err, data) {
            if (err) throw err;
            resolve(data);
        })
    })
}

function addRole() {
    deptChoice().then(function (id) {
        idList = id.map(department => department.id)

        inquirer.prompt([{
                    name: "title",
                    type: "input",
                    message: "What role would you like to add?"
                },
                {
                    name: "salary",
                    type: "input",
                    message: "What is the salary for this role?"
                },
                {
                    name: "deptId",
                    type: "list",
                    message: "What department should the role be added to?",
                    choices: idList
                }
            ])
            .then(function (input) {
                connection.query(`INSERT INTO role (title, salary, department_id) VALUES("${input.title}", ${input.salary}, ${input.deptId})`,
                    function (err, res) {
                        if (err) throw err;
                        console.table(viewrole());
                        start();
                    });
            });
    });
}

function employeeChoice() {
    return new Promise((resolve, reject) => {
        connection.query(`Select First_Name FROM employee`, function (err, data) {
            if (err) throw err;
            console.log("test 0", data);
            resolve(data);
        });
    });
}

function updateRole() {
    let employeeList = [];
    let titleList = [];

    employeeChoice().then(function (employees) {
        employeeList = employees.map(employee => employee.First_Name)

        roleChoice().then(function (titles) {
            titleList = titles.map(role => role.Title);
            inquirer.prompt([{
                    name: "pickEmployee",
                    type: "list",
                    message: "Which employee do you want to update?",
                    choices: employeeList
                },
                {
                    name: "role",
                    type: "list",
                    message: "What is the employee's new title?",
                    choices: titleList
                }
            ]).then(function (input) {
                lookUpId("role", "title", input.role).then(function (titleData) {
                    console.log("test 3", titleData[0].Id)
                    lookUpId("employee", "First_Name", input.pickEmployee).then(function (employeeData) {
                        connection.query("UPDATE employee SET ? WHERE ?", 
                        [{
                            First_Name: input.pickEmployee
                        }, 
                        {
                            Role_Id: titleData[0].Id

                        }], function (err, res) {
                            if (err) throw err;
                            console.table(res);
                            start();
                        })
                    })
                })
            })
        })
    })
}                      