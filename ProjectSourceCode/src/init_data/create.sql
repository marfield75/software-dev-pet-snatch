CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username text,
    first_name text, 
    last_name text,
    password text,
    password_hash text,
    email text
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
    bio text   
);

CREATE TABLE users_to_pets(
    user_id SMALLINT,
    pet_id SMALLINT
);
