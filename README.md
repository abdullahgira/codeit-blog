# Codeit - Blog
Is a complete blog system where after users sign up They can 

 - Create posts, and comments.
 - Follow users they like by searching their names.
 - Be notified when one of the users they follow made a post or when they are mentioned in a comment.

This project has been used as backend for an android application made by [Sherif Shahin](https://github.com/SherifShahin) 

## Demo

![enter image description here](https://scontent-hbe1-1.xx.fbcdn.net/v/t1.15752-9/s2048x2048/67136731_673657419713175_5410054231832920064_n.png?_nc_cat=100&_nc_oc=AQlM16uMjx-7h19Yf2xtTOftyRNBDyji478jhDK8cf49nfMzF_zQMH6Yl9fiFv9OoJI&_nc_ht=scontent-hbe1-1.xx&oh=651cd0feb293986f93c8a7151c486afb&oe=5DA74A2E)

## Install
### Requirements
```
node v8.16.0
mongo v3.6.3
```
### Building
```bash
git clone git@github.com:xayden/codeit-blog.git
cd codeit-blog
npm install
```

## Running
```bash
# pwd
# ~/codeit-blog
export codeit_jwtPrivateKey="SomeSecureKey!$"
export codeit_db="mongodb://localhost:27017/codeit"
nodemon
```

## Licence
This work is licensed under Creative Commons Attribution 4.0 International License.
