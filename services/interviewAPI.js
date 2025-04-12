import axios from "axios";
import { Alert } from "react-native";

// Store API URL and Key securely (Use .env or secure storage in production)
const API_URL = process.env.EXPO_PUBLIC_OPEN_AI_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_OPEN_AI_API_KEY;

/**
 * Function to generate interview questions based on job requirements.
 * @param {string} jobRequirements - The job requirements.
 * @returns {Promise<Array>} - Returns the generated interview questions.
 */
export const generateInterviewQuestions = async (jobRequirements) => {
  try {
    const prompt = `
    Generate 5 different technical interview questions based on these job requirements:
    ${jobRequirements}
    
    Make each question unique and tailored to different aspects of the job requirements.
    
    Return the response as a JSON array of objects with the following format:
    [
      {
        "id": "1",
        "title": "Question text here",
        "tags": ["Tag1", "Tag2"],
        "time": "5 min"
      }
    ]
    
    Ensure your response is valid JSON that can be parsed.
    `;

    const response = await axios.post(
      API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert technical interviewer. Always respond with valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.9, // Increased for more variation
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content.trim();
    
    try {
      // Try to parse the JSON
      return JSON.parse(content);
    } catch (parseError) {
      console.error("JSON Parse error:", parseError);
      console.log("Response content:", content);
      
      // If parsing fails, try to extract JSON using regex
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (secondError) {
          console.error("Second parse attempt failed:", secondError);
        }
      }
      
      // If all parsing attempts fail, return default questions
      console.log("Returning default questions");
      return [
        { id: "1", title: "Explain RESTful API architecture and its key principles", tags: ["API", "Backend"], time: "5 min" },
        { id: "2", title: "Describe your experience with modern JavaScript frameworks", tags: ["JavaScript", "Frontend"], time: "5 min" },
        { id: "3", title: "How do you approach debugging complex issues in a large codebase?", tags: ["Debugging", "Problem Solving"], time: "5 min" },
        { id: "4", title: "Explain the concept of responsive design and its implementation", tags: ["UI/UX", "Frontend"], time: "5 min" },
        { id: "5", title: "What strategies do you use for writing maintainable and scalable code?", tags: ["Code Quality", "Best Practices"], time: "5 min" }
      ];
    }
  } catch (error) {
    console.error("API Error:", error);
    Alert.alert("Error", "Failed to generate interview questions. Please try again.");
    
    // Return default questions if API fails
    return [
      { id: "1", title: "Explain RESTful API architecture and its key principles", tags: ["API", "Backend"], time: "5 min" },
      { id: "2", title: "Describe your experience with modern JavaScript frameworks", tags: ["JavaScript", "Frontend"], time: "5 min" },
      { id: "3", title: "How do you approach debugging complex issues in a large codebase?", tags: ["Debugging", "Problem Solving"], time: "5 min" },
      { id: "4", title: "Explain the concept of responsive design and its implementation", tags: ["UI/UX", "Frontend"], time: "5 min" },
      { id: "5", title: "What strategies do you use for writing maintainable and scalable code?", tags: ["Code Quality", "Best Practices"], time: "5 min" }
    ];
  }
};

/**
 * Function to analyze the answer and provide feedback.
 * @param {string} question - The interview question.
 * @param {string} answer - The user's answer.
 * @returns {Promise<Object>} - Returns the feedback.
 */
/**
 * Function to analyze the answer and provide feedback.
 * @param {string} question - The interview question.
 * @param {string} answer - The user's answer.
 * @returns {Promise<Object>} - Returns the feedback.
 */
export const analyzeAnswer = async (question, answer) => {
  try {
    const prompt = `
    Analyze this interview answer for the question: "${question}"
    
    Answer: "${answer}"
    
    Provide detailed and specific feedback based on the quality of this answer. The feedback should:
    1. Identify specific strengths in the answer (concrete concepts, good examples, clear explanations)
    2. Suggest specific improvements that would make the answer stronger
    3. Compare the answer against what would be expected in a professional interview
    
    Provide feedback in JSON format with the following structure:
    {
      "strengths": ["Specific strength 1 with example from their answer", "Specific strength 2 with example from their answer"],
      "improvements": ["Specific improvement 1 with suggestion", "Specific improvement 2 with suggestion"],
      "overallRating": 85,
      "correctPoints": ["Key point 1 they got right", "Key point 2 they got right"],
      "missingPoints": ["Important point 1 they missed", "Important point 2 they missed"]
    }
    
    The overallRating should be between 0-100 based on the quality of the answer.
    Only return valid JSON that can be parsed.
    `;

    const response = await axios.post(
      API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are an expert technical interviewer providing detailed, constructive and honest feedback. Always respond with valid JSON. Your feedback should be specific to the answer given, not generic." 
          },
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

    const content = response.data.choices[0].message.content.trim();
    
    try {
      // Try to parse the JSON
      return JSON.parse(content);
    } catch (parseError) {
      console.error("JSON Parse error:", parseError);
      console.log("Response content:", content);
      
      // If parsing fails, try to extract JSON using regex
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (secondError) {
          console.error("Second parse attempt failed:", secondError);
        }
      }
      
      // If all parsing attempts fail, return default feedback
      console.log("Returning default feedback");
      return {
        strengths: ["Your answer addressed the question", "You provided some relevant information"],
        improvements: ["Consider adding more specific examples", "Try to structure your answer more clearly"],
        overallRating: 70,
        correctPoints: ["Basic understanding of the concept"],
        missingPoints: ["More technical details needed"]
      };
    }
  } catch (error) {
    console.error("API Error:", error);
    Alert.alert("Error", "Failed to analyze answer. Please try again.");
    
    // Return default feedback if API fails
    return {
      strengths: ["Your answer addressed the question", "You provided some relevant information"],
      improvements: ["Consider adding more specific examples", "Try to structure your answer more clearly"],
      overallRating: 70,
      correctPoints: ["Basic understanding of the concept"],
      missingPoints: ["More technical details needed"]
    };
  }
};