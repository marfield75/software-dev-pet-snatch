CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username text,
    first_name text, 
    last_name text,
    password text,
    email text
);

CREATE TABLE pets(
    id SERIAL PRIMARY KEY,
    name text,
    class text,
    breed text,
    eye_color text,
    birthday DATE, 
    location text,
    bio text   
);

CREATE TABLE breeds(
    id SERIAL PRIMARY KEY,
    name text,
    personality text 
);

CREATE TABLE users_to_pets(
    user_id SMALLINT,
    pet_id SMALLINT
);

CREATE TABLE pets_to_breeds(
    pet_id SMALLINT,
    breed_id SMALLINT
);
