Running the Project
Running the Application Manually
Navigate to the Backend Directory: First, make sure you’re in the backend folder of your project.

bash
cd backend
Start the Application: Run the following command to start the application:

bash
node app.js
This will launch your app in development mode (or whatever configuration you have in app.js).

Running the Application with Docker
Build the Docker Image: Before running the app with Docker, you need to build the Docker image. You can do this by running the following command in your terminal:

bash
docker build -t dribbble-app .
This command tells Docker to build an image with the tag dribbble-app using the Dockerfile present in the current directory.

Run the Docker Container: Once the image is built, you can run the application inside a Docker container. Use the following command to do so:

bash
docker run --env-file ./backend/.env -p 5000:5000 dribbble-app
The --env-file ./backend/.env option loads environment variables from your .env file, making sure that all necessary configurations (like database connections, API keys, etc.) are available to the app inside the container.
The -p 5000:5000 option maps port 5000 inside the container to port 5000 on your local machine, allowing you to access the app through http://localhost:5000.


Project Github link : https://github.com/Parisa-arabi/Dribbble