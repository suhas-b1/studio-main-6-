# Nourish Connect - A Firebase Studio Project

This is a Next.js application built in Firebase Studio. It demonstrates a platform for connecting food donors with recipient NGOs, featuring AI-powered matching and a real-time user interface.

## Running the Application Locally

To run this project on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/en) (version 20 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### 1. Install Dependencies

Once you have the project files on your computer, open your terminal in the project's root directory and run the following command to install all the required packages:

```bash
npm install
```

### 2. Set Up Your Firebase Project

The application requires a Firebase project to handle authentication and the database.

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and click "Add project". Follow the on-screen instructions.
2.  **Enable Authentication**: In your new project, navigate to the **Authentication** section. Click "Get started" and enable the **Email/Password** and **Google** sign-in providers.
3.  **Enable Firestore**: Navigate to the **Firestore Database** section. Click "Create database", start in **test mode** for now (you can secure it later), and choose a location for your database.
4.  **Get Your Firebase Config**:
    *   Go to your **Project Settings** (click the gear icon ⚙️ next to "Project Overview").
    *   In the "General" tab, scroll down to the "Your apps" section.
    *   Click the web icon (`</>`) to create a new web app.
    *   Give your app a nickname (e.g., "Nourish Connect Local") and click **Register app**.
    *   Firebase will display a `firebaseConfig` object. You will need these values for the next step.

### 3. Configure the App

Copy the configuration values from the previous step into the `src/firebase/config.ts` file in this project, replacing the placeholder values.

### 4. Set Up Environment Variables

The AI features in this app use Google's Gemini model via Genkit. You'll need an API key.

1.  **Get an API Key**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to generate a free API key.
2.  **Create an Environment File**: In the root directory of the project, create a new file named `.env.local`.
3.  **Add the Key**: Add the following line to your `.env.local` file, replacing `YOUR_API_KEY_HERE` with the key you just generated:
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

### 5. Run the Development Server

You're all set! Run the following command in your terminal to start the app:

```bash
npm run dev
```

The application will now be running on [http://localhost:3000](http://localhost:3000) and will be connected to your personal Firebase project.
