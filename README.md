## Installation

1. Clone this repository

2. Navigate to the project folder

3. Install dependencies for both backend and frontend:
    ```
    cd back
    npm install
    cd ../front
    npm install
    ```
4. Setup the database:

- In this file `/back/src/utils/sequelize.js`, uncomment this part to recreate an empty one:

    ```
    // await sequelize.sync({
    //   alter: true,
    // });
    ```

## Usage

- Start Backend Server
    ```
    cd back
    npm run dev
    ```
- Start Frontend Server
    ```
    cd ../front
    npm run dev
    ```
- Open your browser and navigate to:
    ```
    http://localhost:5173
    ```
# toupaw
