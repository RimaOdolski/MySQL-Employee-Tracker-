const actions = [

    {
        type: "list",
        name: "actions",
        message: "What would you like to to?",
        choices: [

            "Add new employee",
            "View all employees",
            "View employees by department",
            "Update employee role",
            "View all roles",
            "Add role",
            "View all departments",
            "Add department",
            "Exit"

        ]

    }
]



module.exports = { actions }