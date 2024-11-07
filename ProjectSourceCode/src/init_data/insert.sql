INSERT INTO users (id, username, first_name, last_name, password, email)
VALUES (1, 'jamie1', 'James', 'Smith', '$2a$12$QyCbeD4dC6hOCKZF3W9Mx.AZ5p.JrEyyX2cZIKhwnJFLuUcttd23q', 'jm2004@gmail.com'), 
(2, 'john2', 'John', 'Green', '$2a$12$u4QxxWvwhQFkLp.CfeeGbO1kCh8xF.aHLu4tGvnE5zu65YqDcDWPS', 'jg1998@gmail.com'),
(3, 'Tom3', 'Tom', 'Blue', '$2a$12$dSmpFORwoVlBcHksxozPC.ETPdOd71Iru6IRDlkcNgCigONZStq3C', 'tb1997@gmail.com');

INSERT INTO pets (id, name, class, breed, eye_color, birthday, location, bio)
VALUES (1, 'rocky', 'dog', 'golden retriever', '2022-06-07','Boulder, Colorado', '-'),
VALUES (2, 'tommy', 'dog', 'pitbull', '2021-07-27','Denver, Colorado', '-');

INSERT INTO users_to_pets(user_id, pet_id)
VALUES (2, 1),
VALUES (3, 2);


-- 1, jm@1
-- 2, jg@1
-- 3, tb@1