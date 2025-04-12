import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  StatusBar, 
  SafeAreaView, 
  TextInput, 
  FlatList,
  Animated,
  Easing,
  ActivityIndicator,
  Alert
} from "react-native";
import { ArrowRight, ArrowLeft, Brain, Search, FileText } from "lucide-react-native";
import { ScrollView } from "react-native-gesture-handler";
import { generateInterviewQuestions, analyzeAnswer } from "../../services/interviewAPI"; // Adjust path as needed
import * as Animatable from 'react-native-animatable';
import { Feather as Icon } from 'react-native-vector-icons';
import { storeData, getData } from '../../utils/storageHelper'; // Adjust path as needed
import { v4 as uuidv4 } from 'uuid';

// Interview Screen with AI Integration
const InterviewScreen = () => {
  const [step, setStep] = useState(1);
  const [jobRequirements, setJobRequirements] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [pastSessions, setPastSessions] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [performanceData, setPerformanceData] = useState({
    questionsAnswered: "0/0",
    strongTopics: [
      { topic: "Loading...", score: "0%" }
    ]
  });

  const spinValue = new Animated.Value(0);

  // Load past sessions on component mount
  useEffect(() => {
    loadPastSessions();
  }, []);

  // Animation steps
  const animationSteps = [
    { text: "Analyzing Job Requirements", color: "#3B82F6", icon: Search },
    { text: "Generating Questions", color: "#A855F7", icon: Brain },
    { text: "Preparing Practice Session", color: "#22C55E", icon: FileText }
  ];

  // Function to animate the steps
  useEffect(() => {
    let timer;
    if (isAnimating && animationStep < animationSteps.length) {
      spinValue.setValue(0);
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      timer = setTimeout(() => {
        setAnimationStep(prev => prev + 1);
      }, 2000);
    } else if (animationStep >= animationSteps.length) {
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationStep(0);
        setStep(2);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [animationStep, isAnimating]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Function to load past sessions from storage
  // Function to load past sessions from storage and calculate analytics
// Function to load past sessions from storage and calculate analytics
const loadPastSessions = async () => {
  try {
    const storedSessions = await getData("interviewSessions");
    if (storedSessions) {
      setPastSessions(storedSessions);
      
      // Update performance data based on past sessions
      if (storedSessions.length > 0) {
        // Calculate questions answered - we have 5 questions per session
        const totalAnswered = storedSessions.length;
        const totalQuestions = Math.ceil(totalAnswered / 5) * 5;
        setPerformanceData(prev => ({
          ...prev,
          questionsAnswered: `${totalAnswered}/${totalQuestions}`
        }));
        
        // Create a more sophisticated analytics for topics
        const topicAnalytics = {};
        
        storedSessions.forEach(session => {
          if (session.question && session.feedback) {
            // Extract a meaningful topic phrase from the question
            const words = session.question.split(' ');
            let topic = '';
            
            // Try to extract a short meaningful phrase (2-3 words)
            if (["how", "what", "why", "can", "discuss", "explain", "describe"].includes(words[0].toLowerCase())) {
              // For questions starting with question words, take first 2-3 significant words
              let topicWords = [];
              for (let i = 1; i < Math.min(words.length, 6); i++) {
                if (words[i].length > 2 && !["the", "and", "for", "that", "with", "this", "your"].includes(words[i].toLowerCase())) {
                  topicWords.push(words[i]);
                  if (topicWords.length >= 2) break;
                }
              }
              topic = topicWords.join(' ');
            } else {
              // For other formats, take the first two significant words
              let topicWords = [];
              for (let i = 0; i < Math.min(words.length, 4); i++) {
                if (words[i].length > 2 && !["the", "and", "for", "that", "with", "this"].includes(words[i].toLowerCase())) {
                  topicWords.push(words[i]);
                  if (topicWords.length >= 2) break;
                }
              }
              topic = topicWords.join(' ');
            }
            
            // Capitalize first letter of each word
            topic = topic.split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            if (!topicAnalytics[topic]) {
              topicAnalytics[topic] = {
                count: 0,
                rating: 0
              };
            }
            
            topicAnalytics[topic].count++;
            
            // Calculate a more accurate score based on feedback
            let score = 0;
            if (session.feedback.overallRating) {
              // If we have an overall rating, use it
              score = session.feedback.overallRating;
            } else {
              // Otherwise calculate from strengths vs improvements
              const strengthsCount = session.feedback.strengths?.length || 0;
              const improvementsCount = session.feedback.improvements?.length || 0;
              score = strengthsCount > 0 || improvementsCount > 0 ? 
                (strengthsCount / (strengthsCount + improvementsCount)) * 100 : 
                50;
            }
            
            topicAnalytics[topic].rating += score;
          }
        });
        
        // Calculate average scores and prepare data
        const strongTopics = Object.keys(topicAnalytics)
          .map(topic => ({
            topic,
            score: `${Math.round(topicAnalytics[topic].rating / topicAnalytics[topic].count)}%`
          }))
          .sort((a, b) => parseInt(b.score) - parseInt(a.score))
          .slice(0, 3);
        
        if (strongTopics.length > 0) {
          setPerformanceData(prev => ({
            ...prev,
            strongTopics
          }));
        }
      }
    }
  } catch (error) {
    console.error("Error loading past sessions:", error);
  }
};

  // Function to save a session
  // Function to save a session with improved analytics tracking
const saveSession = async (sessionData) => {
  try {
    // Enhanced session data with timestamp and score
    const session = {
      id: uuidv4(),
      date: new Date().toLocaleString(),
      timestamp: Date.now(),
      score: sessionData.feedback?.overallRating || 
             (sessionData.feedback?.strengths?.length || 0) * 20, // Calculate a score if not provided
      ...sessionData
    };
    
    const existingSessions = await getData("interviewSessions") || [];
    const updatedSessions = [session, ...existingSessions];
    await storeData("interviewSessions", updatedSessions);
    setPastSessions(updatedSessions);
    
    // Update performance data immediately
    loadPastSessions();
  } catch (error) {
    console.error("Error saving session:", error);
  }
};
  // Function to generate interview questions based on job requirements
  const handleGenerateQuestions = async () => {
    if (!jobRequirements.trim()) {
      alert("Please enter job requirements");
      return;
    }
    
    setIsAnimating(true);
    setAnimationStep(0);
    
    try {
      // Log for debugging
      console.log("Generating questions for requirements:", jobRequirements);
      
      const generatedQuestions = await generateInterviewQuestions(jobRequirements);
      console.log("Questions generated:", generatedQuestions);
      
      if (Array.isArray(generatedQuestions) && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
      } else {
        throw new Error("Invalid questions format received");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Please try again.");
      setIsAnimating(false);
      setAnimationStep(0);
    }
  };

  // Function to handle user submitting an answer
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please enter your answer");
      return;
    }
    
    setStep(4); // Show loading while analyzing
    setFeedback(null); // Clear previous feedback
    
    try {
      const currentQ = questions[currentQuestion];
      
      // Log for debugging
      console.log("Analyzing answer for question:", currentQ.title);
      console.log("User's answer:", answer);
      
      const result = await analyzeAnswer(currentQ.title, answer);
      console.log("Feedback received:", result);
      
      if (result && result.strengths && result.improvements) {
        setFeedback(result);
        
        // Save this Q&A with feedback
        saveSession({
          question: currentQ.title,
          answer: answer,
          feedback: result
        });
      } else {
        throw new Error("Invalid feedback format received");
      }
    } catch (error) {
      console.error("Error analyzing answer:", error);
      alert("Failed to analyze answer. Please try again.");
      
      // Provide default feedback to prevent UI from breaking
      setFeedback({
        strengths: ["You provided an answer", "You attempted the question"],
        improvements: ["Consider adding more details", "Try to be more specific"]
      });
    }
  };

  // Function to navigate to the next step
  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  // Function to navigate to the previous step
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Function to start a new question
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswer("");
      setFeedback(null);
      setStep(3); // Go to answer screen
    } else {
      // All questions completed
      setStep(5); // Go to analytics screen
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back Button */}
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
        )}

        {/* Step 1: Initial Screen */}
        {step === 1 && (
          <ScrollView style={styles.scrollContainer}>
            <Text style={styles.title}>Interview Practice</Text>

            {/* Job Requirements Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Job Requirements</Text>
              <TextInput
                style={styles.inputMultiLine}
                placeholder="Paste job Requirements here"
                multiline
                value={jobRequirements}
                onChangeText={setJobRequirements}
              />
            </View>

            {/* Mock Interview Card */}
            <View style={styles.mockInterviewCard}>
              <Text style={styles.cardTitle}>Mock Interview</Text>
              <Text style={styles.cardSubtitle}>Practice with AI</Text>
              <TouchableOpacity 
                style={styles.startButton} 
                onPress={handleGenerateQuestions}
                disabled={isAnimating}
              >
                <Text style={styles.buttonText}>Start Session</Text>
                <ArrowRight size={16} color="white" />
              </TouchableOpacity>
            </View>

            {/* Animation Steps Display */}
            {isAnimating && (
              <View style={styles.animationStepsContainer}>
                {animationSteps.map((step, index) => 
                  index <= animationStep ? (
                    <Animatable.View 
                      key={index} 
                      animation="fadeIn" 
                      style={[styles.step, { backgroundColor: step.color }]}
                    >
                      <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        {React.createElement(step.icon, { 
                          size: 24,
                          color: "#fff",
                        })}
                      </Animated.View>
                      <Text style={styles.stepText}>{step.text}</Text>
                      {index < animationStep && <Icon name="check" size={20} color="#fff" style={styles.checkIcon} />}
                    </Animatable.View>
                  ) : null
                )}
              </View>
            )}
          </ScrollView>
        )}

        {/* Step 2: Questions List */}
        {step === 2 && (
          <ScrollView style={styles.scrollContainer}>
            <Text style={styles.title}>Technical Questions</Text>
            {questions.length > 0 ? (
              <>
                <FlatList
                  data={questions}
                  scrollEnabled={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.questionItem}>
                      <View style={styles.questionHeader}>
                        <Text style={styles.questionNumber}>Question {item.id}</Text>
                        <Text style={styles.questionTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.questionTitle}>{item.title}</Text>
                      <View style={styles.tagsContainer}>
                        {item.tags.map((tag, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                />
                <TouchableOpacity style={styles.startPracticeButton} onPress={() => setStep(3)}>
                  <Text style={styles.buttonText}>Start Practice</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>No questions available. Please go back and try again.</Text>
                <TouchableOpacity style={styles.startPracticeButton} onPress={() => setStep(1)}>
                  <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* Step 3: Answer Question */}
        {step === 3 && questions.length > 0 && (
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionTitle}>Question {parseInt(questions[currentQuestion]?.id) || 1}/{questions.length}</Text>
            </View>
            <Text style={styles.activeQuestionTitle}>
              {questions[currentQuestion]?.title || "Loading question..."}
            </Text>
            <Text style={styles.questionHint}>
              Focus on providing specific examples and structured answers
            </Text>
            <TextInput
              style={styles.answerInput}
              placeholder="Enter Your Answer here"
              multiline
              value={answer}
              onChangeText={setAnswer}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitAnswer}>
              <Text style={styles.buttonText}>Submit Answer</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Step 4: Feedback */}
{step === 4 && (
  <ScrollView style={styles.scrollContainer}>
    <Text style={styles.title}>AI Feedback</Text>
    
    {/* Loading indicator while waiting for feedback */}
    {!feedback ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Analyzing your answer...</Text>
      </View>
    ) : (
      <>
        {/* Overall Rating */}
        {feedback.overallRating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>Overall Rating</Text>
            <Text style={styles.ratingScore}>{feedback.overallRating}/100</Text>
          </View>
        )}

        {/* Correct Points Section */}
        {feedback.correctPoints && feedback.correctPoints.length > 0 && (
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Correct Points</Text>
            <View style={styles.correctItem}>
              {feedback.correctPoints.map((point, index) => (
                <Text key={index} style={styles.feedbackText}>• {point}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Strengths Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Strengths</Text>
          <View style={styles.strengthItem}>
            {feedback.strengths && feedback.strengths.length > 0 ? (
              feedback.strengths.map((strength, index) => (
                <Text key={index} style={styles.feedbackText}>• {strength}</Text>
              ))
            ) : (
              <Text style={styles.feedbackText}>No specific strengths identified.</Text>
            )}
          </View>
        </View>

        {/* Missing Points Section */}
        {feedback.missingPoints && feedback.missingPoints.length > 0 && (
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Missing Points</Text>
            <View style={styles.missingItem}>
              {feedback.missingPoints.map((point, index) => (
                <Text key={index} style={styles.feedbackText}>• {point}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Areas to Improve Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Areas to Improve</Text>
          <View style={styles.improveItem}>
            {feedback.improvements && feedback.improvements.length > 0 ? (
              feedback.improvements.map((improvement, index) => (
                <Text key={index} style={styles.feedbackText}>• {improvement}</Text>
              ))
            ) : (
              <Text style={styles.feedbackText}>No specific improvement areas identified.</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.analyticsButton} onPress={handleNextQuestion}>
          <Text style={styles.buttonText}>
            {currentQuestion < questions.length - 1 ? "Next Question" : "View Analytics"}
          </Text>
        </TouchableOpacity>
      </>
    )}
  </ScrollView>
)}

        {/* Step 5: Analytics */}
{step === 5 && (
  <ScrollView style={[styles.scrollContainer, { paddingBottom: 80 }]}>
    <Text style={styles.title}>Your Progress</Text>
    
    {/* Performance Overview */}
    <View style={styles.performanceContainer}>
      <Text style={styles.performanceTitle}>Performance Overview</Text>
      <View style={styles.scoreContainer}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Questions</Text>
          <Text style={styles.scoreValue}>{performanceData.questionsAnswered}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Sessions</Text>
          <Text style={styles.scoreValue}>{Math.ceil(pastSessions.length / 5)}</Text>
        </View>
      </View>
    </View>

    {/* Strong Topics */}
    <View style={styles.topicsContainer}>
      <Text style={styles.topicsTitle}>Strong Topics</Text>
      <View style={styles.topicsList}>
        {performanceData.strongTopics.map((item, index) => (
          <View key={index} style={styles.topicItem}>
            <Text style={styles.topicName}>{item.topic}</Text>
            <Text style={[
              styles.topicScore, 
              parseInt(item.score) >= 80 ? styles.scoreExcellent : 
              parseInt(item.score) >= 60 ? styles.scoreGood : 
              styles.scoreAverage
            ]}>{item.score}</Text>
          </View>
        ))}
      </View>
    </View>

    {/* Recent Activity */}
    {pastSessions.length > 0 && (
  <View style={styles.recentActivityContainer}>
    <Text style={styles.topicsTitle}>Recent Activity</Text>
    <View style={styles.activityList}>
      {pastSessions.slice(0, 3).map((session, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.activityItem}
          onPress={() => {
            Alert.alert(
              "Question & Answer",
              `Q: ${session.question}\n\nYour Answer: ${session.answer ? session.answer.substring(0, 150) + (session.answer.length > 150 ? '...' : '') : 'No answer recorded'}\n\nStrengths: ${session.feedback?.strengths?.join(', ') || 'None'}\n\nAreas to Improve: ${session.feedback?.improvements?.join(', ') || 'None'}`
            );
          }}
        >
          <Text style={styles.activityQuestion} numberOfLines={2}>
            {session.question}
          </Text>
          <View style={styles.activityDetailsRow}>
            <Text style={styles.activityDate}>{session.date}</Text>
            <Text style={[
              styles.activityScore,
              (session.feedback?.overallRating || 0) >= 80 ? styles.scoreExcellent : 
              (session.feedback?.overallRating || 0) >= 60 ? styles.scoreGood : 
              styles.scoreAverage
            ]}>
              {session.feedback?.overallRating ? `${session.feedback.overallRating}%` : ''}
            </Text>
          </View>
          <Text style={styles.viewDetailsText}>Tap to view details</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
)}

    {/* Start New Session Button */}
    <TouchableOpacity 
      style={styles.newSessionButton} 
      onPress={() => {
        setStep(1);
        setAnswer("");
        setFeedback(null);
        setCurrentQuestion(0);
      }}
    >
      <Text style={styles.buttonText}>Start New Session</Text>
    </TouchableOpacity>
  </ScrollView>
)}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  inputMultiLine: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 15,
    height: 180,
    fontSize: 16,
    backgroundColor: "#fcfcfc",
    textAlignVertical: 'top',
  },
  mockInterviewCard: {
    backgroundColor: "#0A0E17",
    borderRadius: 10,
    padding: 24,
    marginTop: 20,
  },
  cardTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  cardSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 20,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    marginRight: 8,
  },
  questionItem: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,
    color: "#666",
  },
  questionTime: {
    fontSize: 14,
    color: "#666",
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#495057",
  },
  startPracticeButton: {
    backgroundColor: "#0A0E17",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 80,
  },
  activeQuestionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  questionHint: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 16,
    height: 200,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: "#0A0E17",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    textAlign: 'center',
    marginBottom: 20,
  },
  feedbackSection: {
    marginBottom: 24,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  strengthItem: {
    backgroundColor: "#ecfdf5",
    padding: 16,
    borderRadius: 8,
  },
  improveItem: {
    backgroundColor: "#fff1f2",
    padding: 16,
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: 14,
    marginBottom: 8,
  },
  analyticsButton: {
    backgroundColor: "#0A0E17",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 80,
  },
  performanceContainer: {
    marginBottom: 24,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  scoreItem: {
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  topicsContainer: {
    marginBottom: 24,
  },
  topicsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  topicsList: {
    gap: 12,
  },
  topicItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
  },
  topicName: {
    fontSize: 14,
    fontWeight: "500",
  },
  topicScore: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  newSessionButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  animationStepsContainer: {
    marginTop: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  stepText: {
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 10,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  // Add these new styles to your existing StyleSheet
ratingContainer: {
  backgroundColor: "#f0f9ff",
  padding: 16,
  borderRadius: 8,
  alignItems: "center",
  marginBottom: 24,
},
ratingText: {
  fontSize: 16,
  fontWeight: "600",
  color: "#0369a1",
  marginBottom: 8,
},
ratingScore: {
  fontSize: 24,
  fontWeight: "bold",
  color: "#0ea5e9",
},
correctItem: {
  backgroundColor: "#dcfce7",
  padding: 16,
  borderRadius: 8,
},
missingItem: {
  backgroundColor: "#ffedd5",
  padding: 16,
  borderRadius: 8,
},
// Add these new styles to the StyleSheet
scoreExcellent: {
  color: "#22c55e",
  fontWeight: "bold",
},
scoreGood: {
  color: "#3b82f6",
  fontWeight: "bold",
},
scoreAverage: {
  color: "#f97316",
  fontWeight: "bold",
},
recentActivityContainer: {
  marginBottom: 24,
},
activityList: {
  gap: 12,
},
activityItem: {
  backgroundColor: "#f8f9fa",
  padding: 16,
  borderRadius: 8,
  marginBottom: 10,
  borderLeftWidth: 3,
  borderLeftColor: '#3b82f6',
},
activityQuestion: {
  fontSize: 15,
  fontWeight: "600",
  marginBottom: 8,
},
activityDate: {
  fontSize: 12,
  color: "#666",
},
activityDetailsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 4,
  marginBottom: 6,
},
activityScore: {
  fontWeight: 'bold',
  fontSize: 14,
},
viewDetailsText: {
  fontSize: 12,
  color: '#2563eb',
  textAlign: 'right',
  fontStyle: 'italic',
},
});

export default InterviewScreen;