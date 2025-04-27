# 🤖 AI Career Assistant

**AI Career Assistant** is a React Native mobile application designed to guide users through their career development journey. It empowers job seekers to create personalized cover letters, prepare for interviews with AI-generated feedback, and store their progress—all in one sleek, mobile-first app.

---

## 🚀 Key Features

- 🔐 **User Authentication**
  - Secure sign-up, login, and logout using Firebase Authentication
  - Token-based session management with full validation and error feedback

- ✍️ **AI-Powered Cover Letter Generation**
  - Users input job descriptions and instantly receive tailored cover letters via ChatGPT API
  - Drafts can be saved, listed, and deleted from Firestore

- 🎤 **Interview Preparation Suite**
  - Dynamically generated interview questions based on job postings
  - Real-time AI feedback on answers, including a final assessment summary

- 💾 **Persistent Storage**
  - Local storage of session and profile data using AsyncStorage
  - Structured storage of user-generated content in Firebase Firestore

- 📷 **Native Device Integration**
  - Camera feature allows users to capture and save profile pictures
  - Image URIs persist between sessions with proper permissions handling

- 🌀 **Smooth User Experience**
  - Animated transitions between screens
  - Loading indicators during API calls for improved responsiveness

---

## 📱 Tech Stack

| Layer              | Technology Used                  |
|--------------------|----------------------------------|
| **Frontend**       | React Native                     |
| **Authentication** | Firebase Authentication          |
| **Database**       | Firebase Firestore, AsyncStorage |
| **AI Services**    | OpenAI ChatGPT API               |
| **Utilities**      | Job Description Parser API       |
| **Native Modules** | Camera API, Gesture Handling     |

---
## 🧪 Challenges Faced & Solutions

- ⏳ **API Latency**  
  Addressed delays in ChatGPT responses using async handling and animations

- 🔐 **Session Persistence**  
  Managed session continuity across app restarts with Context API and AsyncStorage

- 📄 **Firestore Document Handling**  
  Navigated complex document paths for storing and retrieving user drafts

- 📸 **Camera URI Management**  
  Ensured consistent image handling across multiple screens with native permissions control

---

## 📎 Project Info

- 📍 Developed by: Jeel Jasani and Harshil Makwana  
---

## 💡 Future Enhancements

- 📧 Email delivery of cover letters and feedback summaries  
- 🎙️ Voice-based answer input for interviews  
- 📈 Analytics dashboard for tracking user progress over time  
- ☁️ Cloud function integrations for scalable backend processing
