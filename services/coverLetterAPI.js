import axios from "axios";
import { Alert } from "react-native";

// Store API URL and Key securely (Use .env or secure storage in production)
const API_URL = process.env.EXPO_PUBLIC_OPEN_AI_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_OPEN_AI_API_KEY;

/**
 * Function to generate a cover letter using OpenAI's GPT API.
 * @param {string} companyName - The name of the company.
 * @param {string} jobTitle - The job title.
 * @param {string} jobDescription - The job description.
 * @param {string} personalTouch - Additional user input for personalization.
 * @returns {Promise<string>} - Returns the generated cover letter text.
 */
export const getAICoverLetter = async (companyName, jobTitle, jobDescription, personalTouch) => {
  try {
    const prompt = `
    Generate a professional cover letter for the following job:
    - Company Name: ${companyName}
    - Job Title: ${jobTitle}
    - Job Description: ${jobDescription}
    - Personal Touch: ${personalTouch || "N/A"}
    `;

    console.log("Company Name:", companyName);
    console.log("Job Title:", jobTitle);
    console.log("Job Description:", jobDescription);
    console.log("Personal Touch:", personalTouch);

    const response = await axios.post(
      API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert resume writer." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("API Error:", error);
    Alert.alert("Error", "Failed to generate cover letter. Please try again.");
    return "";
  }
};
