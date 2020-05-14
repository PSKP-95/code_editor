# Code - RTC
## Installation & Information
### Linux

#### Step 1

Clone Repository

```bash
git clone https://github.com/PSKP-95/code_rtc.git
```

#### Step 2

Setup Database. In **backend/data** folder create sqlite3 database file

```bash
sqlite3  code_RTC.db
```

##### Schema for Sqlite3

###### for bucket

```sqlite
CREATE TABLE bucket (
  node_id integer PRIMARY KEY AUTOINCREMENT,
  type int(2) NOT NULL,
  node varchar(50) NOT NULL,
  file text,
  parent int(11) NOT NULL, 
  flag integer,
  note text
);
```



###### for tests

```sqlite
CREATE TABLE tests (
  test_id integer PRIMARY KEY AUTOINCREMENT,
  type int(1) NOT NULL,
  input text NOT NULL,
  output text NOT NULL,
  node_id int(11) NOT NULL,
  status int(11) NOT NULL DEFAULT '0',
  CONSTRAINT fk_node
  FOREIGN KEY (node_id)
  REFERENCES bucket(node_id)
);
```



#### Step 3

Start flask server. Open terminal in **backend**

```bash
set FLASK_APP=app.py
python -m flask run --port=8888
```

Start angularJS client. Open terminal in **frontend**

```bash
npm start
```

## To Do
- [x] Creating Code
- [x] Running Code on user input
- [x] Creating Testcases
- [x] Running on Testcases
- [x] File explorer
- [x] Context menu for File explorer with delete, cut, rename, paste.
- [x] Export files
- [ ] Import Folders/Files

## Testing
This application is tested on Ubuntu 19.10 and Ubuntu 20.04 with Firefox Web Browser

## mysql and sqlite3
Need to just change `DATABASE` in `code_rtc/backend/src/db.py`
- mysql : for mysql / mariadb
- sqlite3 : for sqlite3 

## Demo

See Video on Youtube https://www.youtube.com/watch?v=QwXDyiKYOas

## License

[Free Software: GNU General Public License v3.0](https://github.com/PSKP-95/code_rtc/blob/master/LICENSE)