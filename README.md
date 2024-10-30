# ChatRaum

ChatRaum is a real-time chat application that allows users to create and join chat rooms, send encrypted messages, view online/offline status of other participants, and delete the entire chat room. It's built using React, Next.js, Tailwind CSS, and Firebase.

## Features

- **Real-time Chat**: Users can send and receive messages in real-time using firebase firestore.
- **Message Encryption**: All messages are encrypted using AES encryption to ensure privacy.
- **User Presence**: Users can see the online/offline status of other participants in the chat room.
- **Room Management**: Users can create new chat rooms and delete existing ones.
- **Responsive Design**: The application is designed to work seamlessly on both desktop and mobile devices.
- **Progressive Web App (PWA)**: ChatRaum is a PWA, which means it can be installed on the user's device and used offline.

## Tech Stack

- **Front-end**: React, Next.js, Tailwind CSS, Lucide Icons, Framer Motion
- **Back-end**: Firebase (Firestore, Hosting)
- **Encryption**: CryptoJS

## Getting Started

1. Clone the repository:

   ```
   git clone https://github.com/chatroom-app/chatroom.git
   ```

2. Install the dependencies:

   ```
   cd chatroom
   npm install
   ```

3. Configure Firebase:
   - Create a new Firebase project in the Firebase Console.
   - Enable Email/Password authentication in the "Authentication" section.
   - Create a new Firestore database in the "Database" section.
   - Copy the Firebase configuration details and replace them in the `firebaseConfig.js` file.

4. Run the development server:

   ```
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

## Deployment

ChatRaum is deployed on Vercel at [chatraum.vercel.app](https://chatraum.vercel.app/). The deployment process is automated through Vercel's integration with the GitHub repository.

## PWA Functionality

ChatRaum is a Progressive Web App (PWA), which means it can be installed on the user's device and used offline. To install the app:

1. Open the application in your web browser.
2. Click on the "+" or "Install" button in your browser's address bar.
3. Follow the instructions to install the app on your device.

Once installed, the app can be accessed and used even when the device is offline.

## Contributing

We welcome contributions to the ChatRaum project. If you find any issues or have suggestions for improvements, please feel free to open a new issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
