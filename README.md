# Codeit - Blog
Is a complete blog system where after users sign up They can 

 - Create posts, and comments.
 - Follow users they like by searching their names.
 - Be notified when one of the users they follow made a post or when they are mentioned in a comment.

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
