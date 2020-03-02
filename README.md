# Code - RTC
## To Do
- [x] Creating Code
- [x] Running Code on user input
- [x] Creating Testcases
- [x] Running on Testcases
- [x] File explorer
- [ ] Export files
- [ ] Import Folders/Files

## mysql and sqlite3
Need to just change `DATABASE` in `code_rtc/backend/src/db.py`
- mysql : for mysql / mariadb
- sqlite3 : for sqlite3 

## Schema for Sqlite3
### for bucket
`# Code - RTC
## To Do
- [x] Creating Code
- [x] Running Code on user input
- [x] Creating Testcases
- [x] Running on Testcases
- [x] File explorer
- [ ] Export files
- [ ] Import Folders/Files

## mysql and sqlite3
Need to just change `DATABASE` in `code_rtc/backend/src/db.py`
- mysql : for mysql / mariadb
- sqlite3 : for sqlite3 

## Schema for Sqlite3
### for bucket
`CREATE TABLE bucket (
  node_id integer PRIMARY KEY AUTOINCREMENT,
  type int(2) NOT NULL,
  node varchar(50) NOT NULL,
  file text,
  parent int(11) NOT NULL, 
  flag integer);`

### for tests

`CREATE TABLE tests (
  test_id integer PRIMARY KEY AUTOINCREMENT,
  type int(1) NOT NULL,
  input text NOT NULL,
  output text NOT NULL,
  node_id int(11) NOT NULL,
  status int(11) NOT NULL DEFAULT '0',
  CONSTRAINT fk_node
    FOREIGN KEY (node_id)
    REFERENCES bucket(node_id)
);`
`

### for tests

`CREATE TABLE tests (
  test_id integer PRIMARY KEY AUTOINCREMENT,
  type int(1) NOT NULL,
  input text NOT NULL,
  output text NOT NULL,
  node_id int(11) NOT NULL,
  status int(11) NOT NULL DEFAULT '0',
  CONSTRAINT fk_node
    FOREIGN KEY (node_id)
    REFERENCES bucket(node_id)
);`

