# Northcoders News API

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
