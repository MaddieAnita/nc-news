# Northcoders News API

Welcome to the NC News API Project! This repo contains the source code for an API that provides several endpoints to interact with the NC News website.
In this readme you will find information on getting this project set-up, explain the tech stack, describe the core features and available endpoints.

To see a demo of the working API, follow the link: https://nc-news-api-e143.onrender.com/api
This will give you all the available endpoints for this API

## Technology Stack

This NC News API is using the following technologies:

- Node.js
- PostgreSQL
- Express.js (including Express.js Routers)
- pg (PostgreSQL client for Node.js)
- pg-format (PostgreSQL extention to protect from SQL injections)
- Jest (for testing)
- Jest Sorted (for checking order of API return)
- Supertest (for testing HTTP endpoints)
- dotenv

## Core Features

(TO UPDATE)

- Articles: CREATE, READ, UPDATE, DELETE articles. Pagination on articles available with a total count feature which also takes into account any filters applied
- Comments: CREATE, READ, UPDATE, DELETE comments and comments on from specific articles. Pagination available on comments by article ID
- Topics: CREATE and READ topics available
- Users: READ users and READ users by username

## Available Endpoints

The NC News API has the following endpoints:

- GET /api/topics - returns a list of topics
- GET /api/articles - returns a list of articles
- GET /api/articles/:article_id - Queries available ["topic", "sort_by", "order", "page", "limit"] - returns an article by speficied ID
- GET /api/articles/:article_id/comments - Queries available ["limit", "page"] - returns comments on a specified article
- GET /api/users - returns a list of users
- GET /api/users/:username - returns a user by username
- POST /api/topics - adds new topic
- POST /api/articles - adds new article
- POST /api/articles/:article_id/comments - posts a new comment to specified article
- PATCH /api/articles/:article_id - updates votes on specified article
- PATCH /api/comments/:comment_id - update votes on speficied comment
- DELETE /api/comments/:comment_id - deletes a comment by specified ID
- DELETE /api/articles/:article_id - deletes an article by specified ID

## Get Started

To get started with this project, follow these steps:

### Prerequisites

Before you begin, make sure you have the following installed on your system:

- Node.js
- PostgreSQL
- npm or yarn (package manager)

### Installation

Clone this repository:

```
git clone https://github.com/your-username/nc-news.git
```

Navigate to the project directory on your local machine:

```
cd nc-news
```

Open the project using your preferred IDE.
Open a terminal in your IDE and run the following command to install packages required:

```
npm install
```

Create a .env.development file and a .env.test file with your database names.  
You can copy the same structure as .env-example file

To create a PostgreSQL database run the db table creation script and seed data script in your terminal (run these in order):

```
npm run setup-dbs
npm run seed
```

Minimum versions needed to run this application:

```
Node.js - 18.0.0
Postgres - 16.0.0
```
