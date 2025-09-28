@echo off
echo Installing BookMyShow LMS Backend...
echo.

echo [1/4] Installing Node.js dependencies...
npm install
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Copying environment file...
if not exist .env (
    copy .env.example .env
    echo Environment file created: .env
    echo Please edit .env with your actual credentials before starting the server.
) else (
    echo Environment file already exists: .env
)

echo.
echo [3/4] Checking MongoDB connection...
echo Please ensure MongoDB is running before starting the server.
echo Local MongoDB: mongodb://localhost:27017/bookmyshow-lms
echo Or use MongoDB Atlas for cloud database.

echo.
echo [4/4] Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your Clerk and Cloudinary credentials
echo 2. Start MongoDB (if using local instance)
echo 3. Run 'npm run dev' to start the development server
echo 4. Server will be available at http://localhost:5000
echo.
echo For detailed setup instructions, see README.md
echo.
pause