# Outreach Tool
This is the release for a tool that allows teams to create their own Data Collection Website. Created originally for Skunk Works Robotics 1983 by Kaeden Wile (2016).

# Instructions
### Login/Create an Account on Amazon Web Services
Their free tier will be enough to cover all of your costs for the first year.

### Create Website
1. Create a new Bucket in Amazon S3 called "<yourTeamNumber>Outreach" or something similar.
2. Select __Properties__ and under __Static Web Hosting__ select *Enable Web Hosting*. Then, write "index.html" for *Index Document*.
3. Open the bucket and select *Upload* from the __Actions__ button. Then, upload everything from the __Web Base__ folder in GitHub. **Only change images and CSS, not any html or javascript!**
4. _[Optional] Connect free DNS from GitHub student pack_ // TODO this gets complicated

### Create Database
1. Select __Launch DB Instance__, and choose *MySQL* as your database.
2. When asked if you plan to use the database for production purposes, select *MySQL* under Dev/Test (so it's free).
3. Configure your database under the free usage teir. Some important points:
  * DB Engine Version: 5.6.27
  * DB Instance Class: db.t2.micro
  * Multi-AZ Deployment: NO
  * Allocated Storage: Anything less than 20gb
  * Remember your DB identifer, master username, and password
4. For Advanced Settings, leave everything default and remember what you put for your Database Name

### Create Lambda Function
##### Build your own copy of Lambda Code from the folder Lambda Code
1. Replace the strings in lines 17-19 with their appropriate values
  * __username__ is the username of your database
  * __password__ is the password of your database
  * __Amazon RDS URL__ is found if you select your RDS instance and look for *Endpoint* but take off the ":3306"
  * __database__ is the name of your database instance, not your identifier
2. Zip the lambda_function.py file and the my_mysql folder

##### Partly Set up Your API
1. Under __API Gateway__ select *Create API*. Make sure the option *New API* is selected, and remember what you name your API.
2. Under __Actions__, create a new Resource named "questions".
3. Within the newly created questions resource, create a POST method

##### Create the Lambda Function
1. Open __AWS Lambda__ and select *Create a Lambda Function*.
2. In filter, search for "microservice-http-endpoint-py" and select the one result. Make sure that the runtime is python 2.7.
3. Set __Resource Method__ to the resource you created (title "questions"), change __Method__ from *GET* to *POST*, and continue.
4. Add an appropriate description and remember whichever name you choose.
5. To add Lambda Function Code, change __Code Entry Type__ to *Upload a .ZIP File*, then choose the zip file you made earlier.
6. Give a name to the security role, and create the function.

##### Finish Setting Up Your API
1. In your "questions" resource, select your POST method. Change __Integration Type__ to *Lambda Function*, and __Lambda Region__ to whichever AWS Region you created your Lambda Function in. (It isn't too hard to look through all of them if you forgot)
2. Save and accept the added permission.
3. Select your resource "questions" then, under __Actions__, choose *Enable CORS*. Don't change any of the options.
4. Select *Deploy API* from __Actions__, and make sure you deploy to "prod".
5. Go into the __Stages__ Menu and select *Prod*. Under the tab __SDK Generation__, set the __Platform__ to *Javascript* and then generate an SDK.
6. Directly copy the "apigClient.js" file and "lib" folder into your Amazon S3 Bucket. *(This step is why it is important that your resource was named "questions"). If anything doesn't work, check the final.html file and troubleshoot.*

At this point, you should be able to access your website via the link when you first created your bucket. After generating questions, your system will be up and running!

### Run R-COT
