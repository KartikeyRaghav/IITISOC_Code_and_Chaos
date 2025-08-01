# Ignitia - Project Documentation

Ignitia is a cloud-based web deployment platform designed to simplify the process of building, deploying, and managing web projects. The platform’s design is centered on efficiency, security, and a minimal yet powerful user experience. This documentation provides a comprehensive overview of both the frontend and backend components.

---

## Frontend

The frontend serves as the primary user interface, built on a modern and robust technology stack to provide a fast and performant experience.

### Technology Stack

- **React.js**: The core library for building interactive, component-driven user interfaces.
- **Next.js**: A React framework that enables server-side rendering and routing for a fast user experience.
- **CSS Modules**: Used for modular, scoped, and maintainable styling to ensure a consistent dark theme and smooth UI transitions.
- **Axios**: Employed for handling asynchronous communication with the backend REST APIs.

### Core Features

- **Secure Authentication**: A robust system for user signup and login, including an OTP-based verification process.
- **GitHub Integration**: Seamless integration with GitHub via an OAuth application, allowing users to connect their repositories for deployment.
- **Automated Deployment**: Users can install a GitHub App to trigger automatic deployments upon new pushes or merges.
- **Project Management**: A centralized dashboard provides a visual overview of all user projects and their deployment status.
- **Flexible Deployment Workflow**: Projects can be created by either uploading a ZIP/HTML file or by connecting a GitHub repository.
- **Customizable Deployments**: Users can set environment variables for their projects, which are loaded before the Docker image creation process.
- **Deployment History & Promotion**: The platform provides a detailed history of each deployment, including real-time logs. Any successful deployment can be promoted to the production environment.
- **URL & SSL Management**: Each project is assigned two unique subdomains, one for a preview environment and one for production, both of which are automatically SSL-certified.
- **Analytics Dashboard**: A comprehensive analytics section with interactive charts and metrics provides insights into total page visits, unique visits, and daily/weekly traffic data.

---

## Backend

The backend is built on a high-performance, containerized architecture that handles the core logic for the entire platform.

### Technology Stack

- **Express.js**: A web server framework for handling API routes and middleware.
- **MongoDB**: A NoSQL database used for data persistence.
- **Mongoose**: An object data modeling (ODM) library for MongoDB.
- **Docker**: Used for containerizing user projects.
- **JWT (JSON Web Tokens)**: For secure, token-based authentication.

### Core Logic and Services

- **Authentication and Authorization**: A `verifyJWT` middleware secures all API routes, managing the login, logout, and token refresh flow. User data, including GitHub tokens, is stored securely in the database.
- **Database Models**: The backend uses dedicated models for `User`, `Project`, `Deployment`, `EnvVar`, and `PageVisit` to manage all aspects of the application.
- **GitHub Integration**: Manages the OAuth flow for user authentication and processes webhooks to automatically trigger deployments from GitHub push and merge events.
- **Build System**: This system handles the entire build process, from cloning a repository or extracting an uploaded file to detecting the tech stack (e.g., Next.js, React), generating a Dockerfile, and building a Docker image.
- **Deployment System**: Manages the lifecycle of each project deployment, including versioning, status updates, and container management.
- **Analytics System**: Tracks client-side data like IP addresses, user-agents, and referrers to provide comprehensive analytics for each project.

---

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Local Setup

To run the Ignitia project locally, you need to clone the repository and set up both the frontend and backend.

1.  **Clone the repository**:
    ```sh
    git clone [https://github.com/KartikeyRaghav/IITISOC_Code_and_Chaos.git](https://github.com/KartikeyRaghav/IITISOC_Code_and_Chaos.git)
    cd IITISOC_Code_and_Chaos
    ```
2.  **Set up the frontend**:
    ```sh
    cd frontend
    npm install
    ```
3.  **Set up the backend**:
    ```sh
    cd ../backend
    npm install
    ```

### Environment Variables

Both the frontend and backend require a `.env.local` file for configuration. This file is critical for connecting the components and integrating with services like GitHub. Please contact the project authors for this file.

### Running the Application

1.  **Start the backend server**:
    ```sh
    cd backend
    npm run dev
    ```
2.  **Start the frontend server**:
    `sh
cd ../frontend
npm run dev
`
    The application will be accessible at `http://localhost:4000` (frontend).

---

## Future Enhancements

- **Integration with other Git providers**: Extend the platform to support GitLab, Bitbucket, and other version control systems.
- **Collaborator Management**: Implement a feature for users to invite collaborators to their projects.
- **Advanced Analytics**: Enhance the analytics dashboard with more detailed metrics and custom reporting features.
