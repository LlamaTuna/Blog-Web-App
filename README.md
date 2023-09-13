
#### Installation requirements ####

* NodeJS 
    - follow the install instructions at https://nodejs.org/en/
    - we recommend using the latest LTS version
* Sqlite3 
    - Windows users: follow instructions here https://www.sqlitetutorial.net/download-install-sqlite/
    - Mac users: it comes preinstalled
    - Linux users: use a package manager eg. apt install

To install all the node packages run ```npm install``` from the project directory

#### Help with node SQLite3 ####

A few aspects SQLite3 work a little differently to mySql but all of the key concepts are the same

Find the API documentation at:
https://github.com/TryGhost/node-sqlite3/wiki/API

Find node SQLite tutorials at:
https://www.sqlitetutorial.net/sqlite-nodejs/
This also a good resource to find examples and tutorials around SQLite queries

To get started:

Run ```npm run build-db``` to create the database (database.db)
Run ```npm run start``` to start serving the web app (Access via http://localhost:3000)

You can also run: 
```npm run clean-db``` to delete the database before rebuilding it for a fresh start

run ```npm install```, ```npm run build-db```, and ```npm run start``` 

#### Student notes: Jeff Becker DNW CM2040  ####

 This program was created on Ubuntu 22.04.2 LTS, 64-bit. 

 In testing, node modules and the database were deleted. The program successfully ran with 
 ```npm install``` followed by ```npm run build-db``` and ```npm run start```. No issues were 
 detected at run time. 

 The root is the reader view at local http://localhost:3000/ 

 The author portal can be accessed from the navigation bar or at http://localhost:3000/author/login

 !!! AT FIRST RUN, YOU HAVE TO RESET THE PASSWORD  at http://localhost:3000/reset !!!

 The database is prepoulated with an username "Joe Martino". Reset the password to something you can recall. Proceed to http://localhost:3000/author/login. Login with Joe Martino and your password. You can now access Joe Martino's author page. From there you can create a draft, publish, edit and delete. You can also change your author settings. Note that the author settings are redundant with the exception of author name. The setting requirement in the midterm specification is fulfilled but all that is really needed is "author name." Everything else can be done with edit or reset. 

 Create your own author: Go to http://localhost:3000/author/register. Create any username and password. 
 You'll be redirected to a blank author page for you to create articles. Click the home button in the nav bar or enter http://localhost:3000/. YOu can now see your published articles. Select an article from the hyperlink.



