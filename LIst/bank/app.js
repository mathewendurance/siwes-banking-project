const express = require('express')
const app = express()
const port = 3000
const path = require('path');
const {ObjectId} = require('mongodb');
var http=require("http")
var bodyParser=require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended:true
}))

var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(cookieParser());
//The session secret can be anything
app.use(session({secret: "kjmfkdkfjiodsfjiojee232"}));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));

let users=['endurance','money']
let admin_email="admin@gtbank.com"
let admin_password="nigeria"
app.use(express.static('public'))

const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri, { useNewUrlParser: true });

app.get('/', function (req, res) {
  //console.log(req.cookies)
 let admin_user=req.cookies["admin_user"];

    let user=req.cookies["user"];


 
           //admin user is logged in 
            if( typeof admin_user !== 'undefined' && admin_user !== null){
                res.render('admin_access_homepage',{username:admin_user})
            }
    // user is logged in
           else if (typeof user !== 'undefined' && user !== null){
                res.render('user_homepage',{username:user})
            }
           //no user is logged in
           else{
            res.sendFile(path.join(__dirname+'/public/home.html'))
           }
       


})
app.get('/s',(req,res) => {
  res.cookie('horg', 'sam', {maxAge: 360000});
  var cookie = getcookie(req);
  console.log(cookie[0].split('=')[1]);
});

function getcookie(req) {
  var cookie = req.headers.cookie;
  //user=someone; session=QyhYzXhkTZawIb5qSl3KKyPVN (this is my cookie i get)
  return cookie.split('; ');
}
app.get('/login', (req, res) => res.sendFile(path.join(__dirname+'/public/form.html')))
app.get('/customer', (req, res) => res.sendFile(path.join(__dirname+'/public/customer_page.html')))
app.get('/user/new', (req, res) => res.sendFile(path.join(__dirname+'/public/new_user.html')))
app.post('/user/new', function (req, res) {
    let email=req.body.email
    let name=req.body.name
    
    
    
    let username=  req.body.username
        let password=req.body.password
    
client.connect(err => {
  const collection = client.db("endurance").collection("users");
  collection.insertOne({user:username,pass:password,name:name,email:email}, function(err, r) {
    if (err==null){
      res.setHeader("Content-Type", "text/html");
      console.log('user added')
      //res.cookie('user', username, {maxAge: 360000});
      res.redirect('/')
      //res.end()
    }else{
      assert.equal(null, err);
    console.log(r.insertedCount);
    assert.equal(1, r.insertedCount);
   console.log('user not added ')
     let error='User not added'
      res.render('login-error',{error:error})

}
});
    

})
})



app.post('/login', function (req, res) {
    let username=  req.body.username
        let password=req.body.password
    
client.connect(err => {
  const collection = client.db("endurance").collection("admin");
  collection.findOne({user:username,pass:password}, function(err, r) {
    if (err===null && r!==null){
        console.log(r);
      res.setHeader("Content-Type", "text/html");
      console.log('successful login')
      res.cookie('admin_user', username, {maxAge: 360000});
      res.redirect('/')
      //res.end()
    }else{
      const collection_user = client.db("endurance").collection("users");
      collection_user.findOne({user:username,pass:password}, function(err, r) {
        if (err===null && r!==null){
            console.log(r);
          res.setHeader("Content-Type", "text/html");
          console.log('successful login')
          res.cookie('user', username, {maxAge: 360000});
          res.redirect('/')
          //res.end()
        }else{
          assert.equal(null, err);
        
         let error='Invalid login'
          res.render('login-error',{error:error})
    
    }
    });
    

}
});
    

})
})



app.post('/user/login', function (req, res) {
    let username=  req.body.username
    let password=req.body.password
//check if admin has logged in first

    let admin_user=req.cookies["admin_user"];


    if (typeof admin_user !== 'undefined' && admin_user !== null){

        client.connect(err => {
            const collection = client.db("endurance").collection("admin");
            const usercollection = client.db("endurance").collection("users");
            collection.findOne({user:username,pass:password}, function(err, r) {
                if (err===null && r!==null){
                    console.log(r);
                    res.setHeader("Content-Type", "text/html");
                    console.log('successful admin access login')
                    res.cookie('admin_user', username, {maxAge: 360000});
                    res.redirect('/')
                    //res.end()
                }else{
                    usercollection.findOne({user:username,pass:password}, function(err, r) {
                        if (err===null && r!==null){
                            console.log(r);
                            res.setHeader("Content-Type", "text/html");
                            console.log('successful user access login')
                            res.cookie('user', username, {maxAge: 360000});
                            res.redirect('/')
                            //res.end()
                        }else{
                             res.redirect('/')

                        }
                    });//usercollection ends here



                }
            });//collection ends here


        })
    }
    else{
        //admin is not logged in hence redirect to the homepage
        console.log('admin is not logged ')
        res.redirect('/')
    }




})

app.get('/endurance', (req, res) => res.send('Endurance'))

app.get('/search', function (req, res) {
    let query=  req.param('q')

  res.render('search-result',{query:query})
})




app.get('/admin/add', function(req,res){
  res.render('add')
})

app.get('/register', function (req, res) {
  
  res.render('register')
})

app.post('/register', function (req, res) {
let username=  req.body.username
let password=  req.body.password
   

client.connect(err => {
  const collection = client.db("endurance").collection("users");
  collection.insertOne({user:username,pass:password}, function(err, r) {
    assert.equal(null, err);
    console.log(r.insertedCount);
    assert.equal(1, r.insertedCount);
   
  //client.close();
res.redirect('/')
});
});

   

  
  //res.render('register',{query:query})
})

/*
app.get('/create', function (req, res) {
let username=  'endurance'
let password=  'bankmanager'
   

client.connect(err => {
  const collection = client.db("endurance").collection("admin");
  collection.insertOne({user:username,pass:password}, function(err, r) {
    assert.equal(null, err);
    console.log(r.insertedCount);
    assert.equal(1, r.insertedCount);
   
  //client.close();
res.redirect('/')
});
});
})
*/

app.get('/list', function (req, res) {
    let admin_user=req.cookies["admin_user"];
//    let adminuser_access=req.cookies["adminuser_access"];

    if (typeof admin_user !== 'undefined' && admin_user !== null ){
        //admin user is logged in 
                client.connect(err => {
                    const collection = client.db("endurance").collection("users");
                    let users=[];
                    collection.find({}).toArray(function(err, docs) {
                        // assert.equal(null, err);

                        users=docs;
                        console.log(users);
                        res.render('list',{users:users})
                        //client.close();
                    });


                });
        }
    else{
        res.redirect('/')
    }

  
})
app.post('/add', function (req, res) {
    let username=  req.body.username
    let password=  req.body.password

    let adminuser_access=req.cookies["adminuser_access"];
    if( typeof adminuser_access !== 'undefined' && adminuser_access !== null){
        client.connect(err => {
            const collection = client.db("endurance").collection("users");
            collection.insertOne({user:username,pass:password}, function(err, r) {
                assert.equal(null, err);
                console.log(r.insertedCount);
                assert.equal(1, r.insertedCount);

                //client.close();
                res.render('add')
            });
        });
    }
    else{
        res.redirect('/')
    }





    //res.render('register',{query:query})
})




app.get('/user/logout', function(req, res){
   res.clearCookie('user');
   res.redirect('/')
   //res.send('user logged out');

});

app.get('/admin/logout', function(req, res){
    res.clearCookie('admin_user');
  
    res.redirect('/')


});

mongo = require('mongodb')


app.get('/user/delete/:userId', function (req, res) {
    let admin_user=req.cookies["admin_user"];
    let adminuser_access=req.cookies["adminuser_access"];

    if (typeof admin_user !== 'undefined' && admin_user !== null ){
        //admin user is logged in 
        client.connect(err => {
            const collection = client.db("endurance").collection("users");

            var myquery = { _id: new mongo.ObjectId(req.params['userId']) };
            console.log(myquery)
            collection.deleteOne(myquery, function(err, obj) {
                if (err) throw err;
                console.log("1 document deleted");

                res.redirect('/list')
                // db.close();
            });



        });
    }
    else{
        res.redirect('/')
    }


})

 
app.listen(port, () => console.log(`Example app listening on port ${port}!`))