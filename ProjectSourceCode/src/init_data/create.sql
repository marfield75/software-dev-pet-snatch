CREATE TABLE user_uploads(
    user_id SMALLINT,
    pet_id SMALLINT
);

CREATE TABLE users(
    id SERIAL PRIMARY KEY UNIQUE,
    username text UNIQUE NOT NULL,
    first_name text, 
    last_name text,
    password_hash text,
    email text UNIQUE NOT NULL
);

CREATE TABLE pets(
    id SERIAL PRIMARY KEY,
    name text,
    class text,
    breed text,
    age SMALLINT,
    color text,
    weight SMALLINT,
    birthday DATE, 
    eye_color text,
    location text,
    bio text,
    price float,
    image_url text
);


CREATE TABLE cart(
    user_id SMALLINT,
    pet_id SMALLINT
);

CREATE TABLE wishlist(
    user_id SMALLINT,
    pet_id SMALLINT
);


