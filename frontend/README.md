# Ignitia - Frontend

## Project Overview

Ignitia is a cloud deployment platform that provides a modern, responsive, and intuitive user interface for managing web projects. The frontend is the primary interface, allowing users to handle everything from initial setup and deployment to ongoing analytics.

## Key Features

- **Secure Authentication**: User signup and login with OTP-based verification, restricted to `@iiti.ac.in` email addresses.
- **GitHub Integration**: Seamless OAuth integration to connect and deploy projects directly from GitHub repositories.
- **Automated Deployments**: Trigger automatic deployments on new pushes or merges to a selected branch via a GitHub App.
- **Flexible Project Creation**: Create projects by connecting a GitHub repository or by uploading a ZIP/HTML file.
- **Project Management Dashboard**: A centralized dashboard to view project status, manage deployments, and access key actions.
- **Customizable Deployments**: Set environment variables for projects, which are loaded before the Docker image creation process.
- **Deployment History**: View a detailed history of all deployments, including real-time logs, and promote successful builds to a production environment.
- **URL & SSL Management**: Automatic assignment of unique subdomains for preview and production environments, both with SSL certification.
- **Analytics Dashboard**: Comprehensive charts and metrics to monitor total visits, unique visitors, and daily/weekly traffic.

## Technology Stack

The Ignitia frontend is built using a modern and robust technology stack:

- **React.js**: The core library for building interactive, component-driven user interfaces.
- **Next.js**: A powerful React framework for server-side rendering, routing, and static site generation, ensuring a fast and performant user experience.
- **CSS Modules**: Used for modular, scoped, and maintainable styling, with a focus on implementing a consistent dark theme.
- **Axios**: Employed for handling asynchronous communication with the backend REST APIs.

## Local Setup

To run the Ignitia frontend locally, follow these steps:

1.  **Clone the repository**:

    ```bash
    git clone [https://github.com/KartikeyRaghav/IITISOC_Code_and_Chaos.git](https://github.com/KartikeyRaghav/IITISOC_Code_and_Chaos.git)
    cd frontend
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Configure environment variables**:

    The project requires a `.env.local` file to configure API endpoints and GitHub OAuth keys. This file is essential for local development.

    - Contact the project authors at `sse240021008@iiti.ac.in` or `me240003057@iiti.ac.in` to obtain the file.

4.  **Start the development server**:

    ```bash
    npm run dev
    ```

The application will be accessible at `http://localhost:4000`.

## Authors

- **Kartikey Raghav**
- **Prachi Singh**
