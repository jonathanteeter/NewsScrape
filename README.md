# NewsScrape
This is a full-stack News application that lets users view and leave comments on the latest news. 

## What the project does
* The application allows the user to pull (scrape) the latest news headlines.   
    * Headline, Summary, and URL are provided for each article.  
    * The user can then select the news story of interest, click on the URL, and read the full article.  
* The user can also save an article and leave a comment on the latest news.

## Design & Technology
* The application uses Cheerio to scrape the news and a NoSQL Mongoose database. 
    * MongoDB is a database that allows you to store documents with a dynamic structure inside a collection.
    * Mongoose Model is then mapped to a MongoDB Document via the Model's schema definition.
* Key technologies used to build this application are:
    * HTML and CSS -- Provides the means to create structured documents with style
    * Bootstrap -- Responsive Front-end framework
    * Handlebars -- Front-end templating engine
    * Node.js -- Server-side JavaScript environment
    * Express.js -- Node.js web server frameworkk 
    * MongoDB -- NoSQL Database
    * Mongoose -- Provides schemas for database collections
    * Cheerio -- Uses DOM manipulation to parse HTML
    * .gitignore -- node_modules
    * Heroku -- Cloud Application Platform

## Challenges
* Setting up the routes and getting the data to render to the screen was a challenge.
* Understanding promises was also a challenge to overcome.

## Link to [My Portfolio] 
(https://jonathanteeter.github.io/jtPortfolio/)
