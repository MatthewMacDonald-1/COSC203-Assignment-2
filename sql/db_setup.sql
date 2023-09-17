-- create user
CREATE USER 'cosc203' IDENTIFIED BY 'password';
GRANT ALL ON *.* TO 'cosc203' WITH GRANT OPTION;

-- create database
DROP TABLE IF EXISTS Photos;
DROP TABLE IF EXISTS Bird;
DROP TABLE IF EXISTS ConservationStatus;
DROP DATABASE ASGN2;

CREATE DATABASE ASGN2;
USE ASGN2;

-- create tables
CREATE TABLE ConservationStatus (
    status_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(255) NOT NULL,
    status_colour CHAR(7) NOT NULL,
    status_css_tag_partial VARCHAR(30) NOT NULL
);

CREATE TABLE Bird (
    bird_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    primary_name VARCHAR(255) NOT NULL,
    english_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255) NOT NULL,
    order_name VARCHAR(255) NOT NULL,
    family VARCHAR(255) NOT NULL,
    weight VARCHAR(20) NOT NULL,
    length VARCHAR(20) NOT NULL,
    status_id INT NOT NULL,
    CONSTRAINT fk_status_id FOREIGN KEY (status_id) REFERENCES ConservationStatus(status_id)
);

CREATE TABLE Photos (
    bird_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    photographer VARCHAR(255) NOT NULL,
    CONSTRAINT fk_bird_id FOREIGN KEY (bird_id) REFERENCES Bird(bird_id)
);
