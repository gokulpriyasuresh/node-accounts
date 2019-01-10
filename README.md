# node-accounts
Account creation , authentication and get account list with pagination

# Instructions

* Step 1 : Install mongoDb to your system

* Step 2 : Install latest version of NodeJS to your directory.

* Step 3 : Clone the respository with the command and follow the next commands too!!..

``` sh
$ git clone https://github.com/gokulpriyasuresh/node-accounts.git
$ npm install
$ node index.js
```

* Step 4 : To create an account, open your postman app and create a post method with the following URL and body params , 

URL : http://localhost:3000/authentication/createuser

Body params : 
``` r
{
"firstname": "test",
"lastname" : "data",
"username" : "testdata",
"email"    : "testdata@example.com",
"password" : "test12345678"
} 
```

* Step 5 : To retrieve the created accounts create a get method with the following URL and pass the email or username(unique value of json) in query params ,

URL : http://localhost:3000/authentication/getuser/?email=testdata@example.com or http://localhost:3000/authentication/getuser/?username=testdata or http://localhost:3000/authentication/getuser/

* Step 6 : To authenticate the user and generate web token create a post method with the following URL and body params,

URL : http://localhost:3000/authenticate/user

bodyparams : 
``` r 
{
"username" : "testdata",
"password" : "test12345678"
}
```
