import React, { useState,useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Platform, StatusBar, SafeAreaView, TextInput,ActivityIndicator,Animated ,Easing } from "react-native";
import { ArrowRight, UploadCloud,ArrowLeft, Scroll,Search, Brain, FileText, FileCode } from "lucide-react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Document, Packer, Paragraph,TextRun } from "docx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import axios from "axios";
import { getAICoverLetter } from "../../services/coverLetterAPI";
import FullPreviewModal from "../../components/FullPreviewModal";
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Feather';
import { storeData, getData, saveDraftToFirestore, getUserDraftsFromFirestore,deleteDraftFromFirestore } from '../../utils/storageHelper';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from "../../context/AuthContext";

// Cover Letter Screen with Step-Based Flow
const CoverLetterScreen = () => {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [personalTouch, setPersonalTouch] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const { user } = useContext(AuthContext); 

  const opacity = new Animated.Value(0);
  const spinValue = new Animated.Value(0);

   // Function to load drafts from AsyncStorage
   const loadDrafts = async () => {
    try {
      //const storedDrafts = await getData("drafts");
      console.log(`User is: ${user}`);
      if(user){
        const storedDrafts = await getUserDraftsFromFirestore(user?.email);
        console.log(`Drafts are: ${storedDrafts}`)
        if (storedDrafts) {
          setDrafts(storedDrafts);
        }
      }
    } catch (error) {
      console.error("Error loading drafts:", error);
    }
  };

   // Load drafts on component mount
   useEffect(() => {
    loadDrafts();
  }, [user]);

  //spin animation for the icon
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Animation Steps
  const animationSteps = [
    { text: "Parsing the Job Details", color: "#3B82F6", icon: Search },
    { text: "Thinking", color: "#A855F7", icon: Brain },
    { text: "Generating the output", color: "#22C55E", icon: FileText },
    { text: "Formatting the file", color: "#F97316", icon: FileCode }
  ];

  // function to animate the steps
  useEffect(() => {
    let timer;
    if (isAnimating && animationStep < animationSteps.length) {
      opacity.setValue(0);
      spinValue.setValue(0);
      Animated.parallel([
        // Will enable it later for the opacity animation
        // Animated.timing(opacity, {
        //   toValue: 1,
        //   duration: 500,
        //   useNativeDriver: true,
        // }),
        Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        )
      ]).start();

      timer = setTimeout(() => {
        setAnimationStep(prev => prev + 1);
      }, 2000);
    } else if (animationStep >= animationSteps.length) {
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationStep(-1);
        setStep(4);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [animationStep, isAnimating]);


  // Function to navigate to the next step
  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  // Function to navigate to the previous step
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Function to generate the cover letter
  const handleGenerateCoverLetter = async () => {
    setAnimationStep(0);
    setIsAnimating(true);
    const result = await getAICoverLetter(companyName, jobTitle, jobDescription, personalTouch);
    if (result) {
      setCoverLetterText(result);
      //setStep(4); // Have removed as the part of the animation
    }
  };

  // Function to extract the first few lines from the cover letter to be shown in the preview
  const extractFirstLines = (text) => {
    const lines = text.split('\n');
    const startIndex = lines.findIndex(line => line.includes("Manager"));
    
    // Get the next 3 lines, if possible
    const snippet = lines.slice(startIndex, startIndex + 3).join('\n');
    return snippet;
  };

  // Function to share the cover letter
  const shareCoverLetter = () => {
    console.log(coverLetterText.split('\n').map((line)=>{
      console.log(line);
    }));
    let paragraphs = coverLetterText.split("\n").map((line) => 
      new Paragraph({
        children: line ? [new TextRun(line)] : [],
      })
    );

    let doc = new Document({
      sections: [
        {
          children: paragraphs
        },
      ],
    });

    Packer.toBase64String(doc).then((base64)=>{
      const fileName = FileSystem.documentDirectory + "custom.docx";
      console.log(`File Name is : ${fileName}`);
      FileSystem.writeAsStringAsync(fileName, base64, {encoding: FileSystem.EncodingType.Base64}).then(()=>{
        console.log("File created successfully");
        Sharing.shareAsync(fileName);
        console.log("File shared successfully");
      })});
  }

  // Function to save the draft
  const saveDraft= async () => {
    try{
      console.log("Draft saved started");
      const existingDrafts = drafts;
      const currentDraft = {
        id: uuidv4(),
        createdDate: new Date().toLocaleString(),
        title: `${jobTitle} at ${companyName}`,
        content: coverLetterText,
        email: user.email,
      };
      const updatedDrafts = existingDrafts ? [...existingDrafts, currentDraft] : [currentDraft];
      await saveDraftToFirestore(currentDraft); 
      setDrafts(await getUserDraftsFromFirestore(user.email));
      console.log("Draft added successfully!");
    }catch(error){
      console.error("Error adding draft:", error);
    }
  }

  // Function to handle draft selection
  const handleDraftSelection= (item) => {
    console.log("Draft selected");
    setCoverLetterText(item.content);
    setPreviewVisible(true);
    console.log(item);
  }

  // Function to delete a particular draft
  const onDelete = async (id) => {
    console.log("Deleting draft with id:", id);
    try {
      await deleteDraftFromFirestore(id);
      setDrafts((prevDrafts) => prevDrafts.filter((draft) => draft.id !== id));
      const updatedDrafts = drafts.filter(item => item.id !== id);
      setDrafts(updatedDrafts);
    } catch (error) {
      console.error("Failed to delete draft:", error);
    }
    //await storeData("drafts", updatedDrafts);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
        )}
        {step === 1 && (
          <>
            {/* Page Title */}
            <Text style={styles.title}>Cover Letter</Text>

            {/* Create New Letter Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Create New Letter</Text>
              <Text style={styles.cardSubtitle}>AI-powered letter generation</Text>
              <TouchableOpacity style={styles.startButton} onPress={() => setStep(2)}>
                <Text style={styles.startText}>Start Now</Text>
                <ArrowRight size={16} color="white" />
              </TouchableOpacity>
            </View>

            {/* Recent Drafts Section */}
            <Text style={styles.sectionTitle}>Recent Drafts</Text>
            <FlatList
              data={drafts}
              keyExtractor={(item) => item.createdDate}
              renderItem={({ item }) => (
                <View style={styles.draftItem}>
                  <View style={styles.draftIcon} />
                  <TouchableOpacity onPress={() => handleDraftSelection(item)}>
                  <View>
                    <Text style={styles.draftTitle}>{item.title}</Text>
                    
                    <Text style={styles.draftSubtitle}>Last edited {item.createdDate}</Text>
                  </View>
                  </TouchableOpacity> 
                  <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
                </View>
              )}
            />
            <FullPreviewModal
      visible={isPreviewVisible}
      onClose={() => setPreviewVisible(false)}
      coverLetterText={coverLetterText}
      jobTitle={jobTitle}
    />
          </>
        )}

        {step === 2 && (
        <>
            <ScrollView style={styles.container}>
            <Text style={styles.title}>Enter Job Details</Text>

            <Text style={styles.inputTitle}>Company Name</Text>
            <TextInput
            style={styles.inputSingleLine}
            placeholder="Enter the Company Name"
            value={companyName}
            onChangeText={setCompanyName}
            />

            {/* Job Title */}
            <Text style={styles.inputTitle}>Job Title</Text>
            <TextInput
            style={styles.inputSingleLine}
            placeholder="Enter the Job Title"
            value={jobTitle}
            onChangeText={setJobTitle}
            />

            {/* Job Description */}
            <Text style={styles.inputTitle}>Job Description</Text>
            <TextInput
            style={styles.inputMultiLine}
            placeholder="Enter the job description"
            multiline
            value={jobDescription}
            onChangeText={setJobDescription}
            />

            {/* Your Personal Touch */}
            <Text style={styles.inputTitle}>Personal Touch (Optional)</Text>
            <TextInput
            style={styles.inputMultiLine}
            placeholder="Add your personal touch"
            multiline
            value={personalTouch}
            onChangeText={setPersonalTouch}
            />

            <TouchableOpacity style={styles.nextButton} onPress={() => setStep(3)}>
                <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
            </ScrollView>
        </>
        )}


        {step === 3 && (
          <>
            <Text style={styles.title}>Upload Resume</Text>
            <View style={styles.uploadContainer}>
              <UploadCloud size={40} color="#2563eb" />
              <Text style={styles.uploadText}>Upload your resume (Optional)</Text>
              <TouchableOpacity style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Choose File</Text>
              </TouchableOpacity>
            </View>
            {!isAnimating ? (
              <TouchableOpacity style={styles.nextButton} onPress={handleGenerateCoverLetter}>
              <Text style={styles.buttonText}>Generate Cover Letter</Text>
            </TouchableOpacity>
            ) : (
              <View style={styles.animationStepsContainer}>
            {animationSteps.map((step, index) => 
            index <=animationStep ? (
              <Animatable.View 
                key={index} 
                animation="fadeIn" 
                style={[styles.step, { backgroundColor: step.color }]}
              >
                {/* <Icon name={step.icon} size={24} color="#fff" style={styles.icon} /> */}
                <Animated.View style={step ? { transform: [{ rotate: spin }] } : null}>
            {React.createElement(step.icon, { 
              size: 24,
              color: "#fff",
            })}
          </Animated.View>
                <Text style={styles.stepText}>{step.text}</Text>
                {index < animationStep && <Icon name="check" size={20} color="#fff" style={styles.checkIcon} />}
              </Animatable.View>
            ):null)}
          </View>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <ScrollView style={styles.container}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Preview</Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
        <TouchableOpacity onPress={() => setPreviewVisible(true)}>
            <Ionicons name="eye-outline" size={24} color="black" />
          </TouchableOpacity>
          <Ionicons name="download-outline" size={24} color="black" />
        </View>
      </View>
      
      {/* Cover Letter Preview */}
      <View style={styles.previewContainer}>
        <View style={styles.letterContainer}>
        <Text style={styles.title}>{jobTitle}</Text>
          {/* <Text style={styles.subTitle}>Dear Hiring Manager,</Text> */}
          <Text style={styles.body}>
            {extractFirstLines(coverLetterText)}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.downloadButton} onPress={shareCoverLetter}>
        <Text style={styles.downloadText}>Share DOCX File</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.saveButton} onPress={saveDraft}>
        <Text style={styles.saveText}>Save Draft</Text>
      </TouchableOpacity>
    </ScrollView>
     {/* Full Preview Modal */}
     <FullPreviewModal
      visible={isPreviewVisible}
      onClose={() => setPreviewVisible(false)}
      coverLetterText={coverLetterText}
      jobTitle={jobTitle}
    />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8, // space between title and input
    color: '#828588',
  },
  inputSingleLine: {
    borderBottomWidth: 1,  // Border at the bottom
    borderColor: '#ccc',
    marginBottom: 20,
    paddingLeft: 10,
    paddingTop: 10,
    borderRadius: 4,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
},
  inputMultiLine: {
    borderBottomWidth: 1,  // Border at the bottom
    borderColor: '#ccc',
    marginBottom: 20,
    paddingLeft: 10,
    paddingTop: 10,
    borderRadius: 4,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
},
  card: {
    backgroundColor: "black",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtitle: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 10,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  startText: {
    color: "black",
    fontWeight: "bold",
    marginRight: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  draftItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f8f8f8",
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  draftIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginRight: 1,
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  draftSubtitle: {
    color: "gray",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    height: 100,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  uploadContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 20,
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },
  uploadButton: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  headerPreview: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
    marginVertical: 20,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  icon: {
    marginLeft: 15,
  },
  previewContainer: {
    backgroundColor: "#f7f8fc",
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
  },
  letterContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
  },
  downloadButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  downloadText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
    marginBottom: 20,
  },
  saveText: {
    color: "black",
    fontSize: 14,
    fontWeight: "bold",
  },
  animationStepsContainer: {
    marginTop: 10,
  },
  icon: {
    marginRight: 10,
  },
  stepText: {
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  deleteButton: {
    paddingLeft: 10,  // Space between the text content and the delete button
    paddingRight: 0,  // Ensures that it's on the far right with no extra space
  },
});

export default CoverLetterScreen;