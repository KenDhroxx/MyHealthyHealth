# MongoDB Auth Website

This project is a web application that integrates MongoDB for user authentication and management. It allows users to register, log in, and manage their profiles securely.

## Features

- User registration and login
- Profile management
- Secure password storage using hashing
- JWT-based authentication
- Responsive design

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- EJS (Embedded JavaScript templating)
- CSS

## Project Structure

```
mongodb-auth-website
├── src
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   ├── app.js
│   └── server.js
├── public
│   ├── css
│   └── js
├── views
│   ├── auth
│   ├── partials
│   └── index.ejs
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd mongodb-auth-website
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file based on the `.env.example` file and configure your environment variables.

5. Start the server:
   ```
   npm start
   ```

## Usage

- Visit `http://localhost:PORT` in your browser to access the application.
- Use the registration page to create a new account.
- Log in with your credentials to access your profile.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.