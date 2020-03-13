drop database if exists employee_db;

create database employee_db ;

use employee_db;


create table department (
	department_id int not null auto_increment,
    name varchar(30) not null,
    primary key (department_id)
);

create table role (
	role_id int not null auto_increment,
    title varchar(30) not null,
    salary decimal(10, 2),
    department_id int,  -- (FK)
    primary key (role_id),
	FOREIGN KEY (department_id) REFERENCES department(department_id)
);

create table employee (
	id int not null auto_increment,
    first_name varchar(30) not null,
    last_name varchar(30) not null,
    role_id int, -- (FK)
    manager_id int,
    primary key (id),
	FOREIGN KEY (role_id) REFERENCES role (role_id)
);



INSERT INTO department (name) 
VALUES ("Sales"), ("Engineering"),("Legal"), ("Finance"),("Marketing");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Representative", 60000 ,1),  
("Software Engineer", 80000,2),
("Lawyer", 500000, 3),
("Accountant",75000,4),
("Account Manager", 90000 ,1),
("Engineer", 95000,2),
("Paralegal Assistant", 50000, 3);


insert into employee (first_name, last_name, role_id, manager_id)
values ('besma', 'Muller', 1, null),('Michael', 'nerd', 2, 1),('Amanda', 'Jerry', 3, null),
('Ciera', 'Angel', 4, 3),('Mike', 'Albert', 5, null);