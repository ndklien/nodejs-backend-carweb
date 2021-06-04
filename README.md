## A Simple Backend Website Build by Nodejs and Express 


To run this project, you need to cover these steps:
1. Create a file .env and save 3 variables:
    - ATLAS_URI: *MongoDB address*
    - ACCESS_TOKEN_SECRET: *jwt token secret key as to create token while login*
    - REFRESH_TOKEN_SECRET: optional, but not needed
    *Note: As for ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET, you could create by runnning `require('crypto').randomBytes(64).toString('hex')*
2. Run package.json: `npm install package.json --also=dev` for install dependencies and devDependencies.
3. Run `node server` or `nodemon server` to start running the project

That's it.