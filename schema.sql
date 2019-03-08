-- create db
DROP DATABASE IF EXISTS megalo;
CREATE DATABASE megalo;
USE megalo;

-- create table
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    item_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    product_name VARCHAR(255) NOT NULL,
    department_name VARCHAR(255),
    price FLOAT(8, 2),
    stock_quantity INT DEFAULT 0,
    PRIMARY KEY (item_id)
);
