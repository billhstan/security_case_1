-- The following three commands are not applicable for the serverless database service
-- at PlanetScale. Because, PlanetScale gives you a free database when you registered as
-- user subscibing a free tier plan.
-- DROP DATABASE IF EXISTS security_case_1_db;
-- Create Database security_case_1_db;
-- By default remote database at PlanetScale already uses UTC timezone.

-- You don't need this in PlanetScale environment. It is already UTC by default.
SET GLOBAL time_zone = '-00:00'; -- Can only be done by root admin 

-- Always let your local database server know, the
-- database you want to apply the SQL upon. (database server hosts many databases)
USE security_case_1_db;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS user_roles;

DROP TABLE IF EXISTS absencelogs;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS students_officers;
DROP TABLE IF EXISTS refresh_tokens;

DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS expenditures;
DROP TABLE IF EXISTS currency_lookups;
DROP TABLE IF EXISTS todotasks;
DROP TABLE IF EXISTS priority_levels;



-- Create table: users --
create table users (
-- Column definitions
user_id int AUTO_INCREMENT PRIMARY KEY,
email varchar(255) NOT NULL,
first_name varchar(100),
last_name varchar(100),
role_id int NOT NULL,
course_id int NOT NULL,
password varchar(500) NOT NULL,
admission_id varchar(10) NOT NULL,
created_at timestamp DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
-- Table constraints
-- To ensure each user record has unique email data.
CONSTRAINT uq_users_email UNIQUE KEY (email)
);
-- Create table: user_roles
create table user_roles (
-- Column definitions
role_id int AUTO_INCREMENT PRIMARY KEY,
role_name varchar(20) NOT NULL
-- Table constraints (none required)
-- Note that, there is already one constraint rule set
-- The constraint rule is a primary key constraint rule and
-- It was set when the role_id column was defined (short cut technique)
);

-- Create table: refresh_tokens --
create table refresh_tokens (
-- Column definitions
refresh_token_id bigint AUTO_INCREMENT PRIMARY KEY,
user_id int NOT NULL,
token varchar(600) NOT NULL,
created_at timestamp DEFAULT CURRENT_TIMESTAMP
-- Table constraints (none required)
-- Note that, there is already one constraint rule set
-- The constraint rule is a primary key constraint rule and
-- It was set when the refresh_token_id column was defined (short cut technique)
);
--- Create table: courses ---
create table courses (
-- Column definitions
course_id int AUTO_INCREMENT PRIMARY KEY,
course_name varchar(100) NOT NULL,
course_abbreviation varchar(20) NOT NULL, -- 'DIT', 'DISM', 'DAAA' etc.
created_at timestamp DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
-- Table constraints
CONSTRAINT uq_courses_course_abbreviation UNIQUE (course_abbreviation)
);

--- Create table: students_officers ---
create table students_officers (
-- Column definitions    
student_officer_id int AUTO_INCREMENT PRIMARY KEY,
officer_id int NOT NULL, 
created_by int NOT NULL,
created_at timestamp DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
-- Table constraints
-- The following constraint is applied to ensure that a student cannot assign the same
-- officer more than once, to view his/her internship documents, more than once.
-- The following constraint is applied to ensure that a student can only assign the same
-- officer "once", to view his/her internship documents.
CONSTRAINT uq_students_officers_student_id_officer_id UNIQUE (created_by,officer_id)
);

-- Create table: absencelogs ---
create table absencelogs (
-- Column definitions
absencelog_id int AUTO_INCREMENT PRIMARY KEY,
start_date timestamp NOT NULL,
end_date timestamp NOT NULL,
description varchar(500) ,
created_by int NOT NULL,
created_at timestamp DEFAULT CURRENT_TIMESTAMP
-- Table constraints (none required)
-- The client-side and server-side logic needs to ensure:
-- the student does not create "overlapping" records.
-- The student does not create "duplicate start-end date record.
-- The student does not create record which has start 
-- date later than the current system date.
-- Only student role users can create absencelogs table record.
);

-- Create table: priority_levels ---
create table priority_levels (
-- Column definitions
priority_level_id smallint AUTO_INCREMENT PRIMARY KEY,
code_name varchar(50), 
level_number int NOT NULL,
created_at timestamp DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create table : todotasks
create table todotasks (
-- Column definitions
todotask_id int AUTO_INCREMENT PRIMARY KEY,
title varchar(500),
created_by int NOT NULL, 
deadline timestamp NOT NULL,
priority_level_id smallint NOT NULL,
created_at timestamp DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- Table constraints (not required)
-- Client-side and server-side logic need to do validation to ensure:
-- The deadline should not be past data-time
-- The priority_level_id should use values given by the priority_levels table.
-- Only the record owner or the admin user can delete the record.
);
-- Create table: recipes
create table recipes (
-- Column definitions
recipe_id int AUTO_INCREMENT PRIMARY KEY,
recipe_name varchar(100), 
description varchar(500), 
created_at timestamp DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- Table constraints (not required)
);
-- Proper recipe DB design can be found at https://dev.to/amckean12/designing-a-relational-database-for-a-cookbook-4nj6
-- Create table: recipe_ingredients
create table recipe_ingredients (
-- Column definitions
recipe_ingredient_id int AUTO_INCREMENT PRIMARY KEY,
description varchar(500), 
created_at timestamp DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- Table constraints (not required)
);

-- Create table: expenditures
create table expenditures (
-- Column definitions
expenditure_log_id int AUTO_INCREMENT PRIMARY KEY,
description varchar(500),
amount decimal(15,2), 
spent_on timestamp NOT NULL,
created_at timestamp DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- Table constraints (not required)
);
-- Create table: currency_lookups
-- Reference: https://www.codeproject.com/Articles/359654/11-important-database-designing-rules-which-I-fo-2
create table currency_lookups (
-- Column definitions
currency_lookup_id int AUTO_INCREMENT PRIMARY KEY,
currency_code varchar(10), -- e.g. 'INR', 'USD', 'SGD'
description varchar(50), -- e.g. 'INDIA RUPEES','US DOLLARS','SINGAPORE DOLLARS'
created_at timestamp DEFAULT CURRENT_TIMESTAMP
-- Table constraints (not required)
);

create table brands (
-- Column definitions
brand_id int AUTO_INCREMENT PRIMARY KEY,
brand_name varchar(30) NOT NULL,
brand_url varchar(100) NOT NULL,
created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
-- Table constraints
CONSTRAINT uq_brands_brand_name UNIQUE key (brand_name),
CONSTRAINT uq_brands_brand_url UNIQUE key (brand_url)
);

create table products (
-- Column definitions
product_id int AUTO_INCREMENT PRIMARY KEY,
product_name varchar(150) NOT NULL,
brand_id int NOT NULL,
created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
-- Table constraints
CONSTRAINT uq_products_product_name_brand_id UNIQUE key (product_name,brand_id)
);

-- Remote database server does not support user management operations through SQL commands
-- DROP USER IF EXISTS 'security_case_1_db_adminuser'@'localhost';
-- CREATE USER 'security_case_1_db_adminuser'@'localhost' IDENTIFIED BY 'password123';
-- GRANT ALL PRIVILEGES ON security_case_1_db.* TO 'security_case_1_db_adminuser'@'localhost';
-- ALTER USER 'security_case_1_db_adminuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password123';
-- FLUSH PRIVILEGES;