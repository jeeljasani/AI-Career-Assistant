import React, { useState, useEffect, useContext} from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, SafeAreaView, TextInput, Alert } from "react-native";
import { ArrowRight, ArrowLeft, Edit2, Camera } from "lucide-react-native";
import { ScrollView } from "react-native-gesture-handler";
import ProfileImagePicker from '../Home/ProfileImagePicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from "../../context/AuthContext";

const calculateTotalExperience = (experience) => {
  let totalMonths = 0;

  experience.forEach(exp => {
    const [start, end] = exp.duration.split(" - ");
    const startDate = new Date(start.split('/').reverse().join('-'));
    const endDate = end === "Present" ? new Date() : new Date(end.split('/').reverse().join('-'));

    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    totalMonths += months;
  });

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  return `${years} Years ${months} Months`;
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [screen, setScreen] = useState("main");
  const [activeExperience, setActiveExperience] = useState(null);
  const [activeEducation, setActiveEducation] = useState(null);
  const [activeSkill, setActiveSkill] = useState(null);
  const [skillLevel, setSkillLevel] = useState("Expert");
  const [userData, setUserData] = useState({
    name: "Sarah Wilson",
    title: "Senior Software Engineer",
    personalInfo: {
      email: "sarah@gmail.com",
      phone: "+1 947 928 738",
      country: "Canada"
    },
    experience: [
      { id: 1, title: "Senior Software Engineer", company: "Tech Corp", duration: "2020 - Present", location: "San Francisco, CA" },
      { id: 2, title: "Senior Software Engineer", company: "Tech Corp", duration: "2020 - Present", location: "San Francisco, CA" }
    ],
    skills: {
      skillGap: [
        { name: "React", level: "Expert" },
        { name: "Node.js", level: "Expert" }
      ],
      technical: [
        { name: "React" },
        { name: "Node.js" },
        { name: "TypeScript" },
        { name: "Python" }
      ]
    },
    education: [
      { id: 1, degree: "Master of Computer Science", university: "Stanford University", duration: "2015 - 2019", location: "Stanford, CA" }
    ]
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userData');
        if (jsonValue !== null) {
          setUserData(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        const jsonValue = JSON.stringify(userData);
        await AsyncStorage.setItem('userData', jsonValue);
      } catch (e) {
        console.error("Failed to save data", e);
      }
    };
    saveData();
  }, [userData]);

  const handleReset = (type) => {
    Alert.alert(
      "Confirm Reset",
      `Are you sure you want to reset all ${type}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          onPress: () => {
            if (type === "skills") {
              setUserData(prevState => ({
                ...prevState,
                skills: {
                  skillGap: [],
                  technical: []
                }
              }));
            } else if (type === "experience") {
              setUserData(prevState => ({
                ...prevState,
                experience: []
              }));
            } else if (type === "education") {
              setUserData(prevState => ({
                ...prevState,
                education: []
              }));
            }
          }
        }
      ]
    );
  };

  const renderMainScreen = () => (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.profileHeader}>
      <ProfileImagePicker 
        size={140}
        onImageChange={(imageUri) => {
          
          console.log("Profile image updated:", imageUri);
        }} 
      />
        <Text style={styles.profileName}>{userData.name}</Text>
        <Text style={styles.profileTitle}>{userData.title}</Text>
      </View>
  
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Professional Info</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => setScreen("details")}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>👤</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Personal Details</Text>
          </View>
          <ArrowRight size={20} color="#666" />
        </TouchableOpacity>
  
        <TouchableOpacity style={styles.menuItem} onPress={() => setScreen("experience")}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>💼</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Experience</Text>
            <Text style={styles.menuSubtitle}>{calculateTotalExperience(userData.experience)}</Text>
          </View>
          <ArrowRight size={20} color="#666" />
        </TouchableOpacity>
  
        <TouchableOpacity style={styles.menuItem} onPress={() => setScreen("skills")}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>🔧</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Skills</Text>
            <Text style={styles.menuSubtitle}>{userData.skills.technical.length} Skills</Text>
          </View>
          <ArrowRight size={20} color="#666" />
        </TouchableOpacity>
  
        <TouchableOpacity style={styles.menuItem} onPress={() => setScreen("education")}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>🎓</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Education</Text>
            <Text style={styles.menuSubtitle}>{userData.education.length} Degrees</Text>
          </View>
          <ArrowRight size={20} color="#666" />
        </TouchableOpacity>
  
        <TouchableOpacity 
  style={styles.menuItem}
  onPress={() => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => {
            
            Alert.alert("Logged out successfully");
            logout();
            navigation.replace("Login");
          }
        }
      ]
    );
  }}
>
  <View style={styles.menuIconContainer}>
    <Text style={styles.menuIcon}>🚪</Text>
  </View>
  <View style={styles.menuContent}>
    <Text style={styles.menuTitle}>Logout</Text>
  </View>
  <ArrowRight size={20} color="#666" />
</TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderDetailsScreen = () => (
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.screenTitle}>Personal Details</Text>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Full Name</Text>
        <Text style={styles.formValue}>{userData.name}</Text>
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Email</Text>
        <Text style={styles.formValue}>{userData.personalInfo.email}</Text>
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Phone Number</Text>
        <Text style={styles.formValue}>{userData.personalInfo.phone}</Text>
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Country</Text>
        <Text style={styles.formValue}>{userData.personalInfo.country}</Text>
      </View>

      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => setScreen("editDetails")}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderEditDetailsScreen = () => (
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.screenTitle}>Personal Details</Text>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Full Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your full name"
          defaultValue={userData.name}
          onChangeText={(text) => setUserData(prevState => ({ ...prevState, name: text }))}
        />
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Email</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your email"
          defaultValue={userData.personalInfo.email}
          keyboardType="email-address"
          onChangeText={(text) => setUserData(prevState => ({ ...prevState, personalInfo: { ...prevState.personalInfo, email: text }}))}
        />
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Phone Number</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your phone number"
          defaultValue={userData.personalInfo.phone}
          keyboardType="phone-pad"
          onChangeText={(text) => setUserData(prevState => ({ ...prevState, personalInfo: { ...prevState.personalInfo, phone: text }}))}
        />
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Country</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your country"
          defaultValue={userData.personalInfo.country}
          onChangeText={(text) => setUserData(prevState => ({ ...prevState, personalInfo: { ...prevState.personalInfo, country: text }}))}
        />
      </View>

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={() => setScreen("details")}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderExperienceScreen = () => (
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.screenTitle}>Experience</Text>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setScreen("editExperience")}
      >
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>Add New Experience</Text>
      </TouchableOpacity>

      {userData.experience.map((exp, index) => (
        <View key={index} style={styles.experienceItem}>
          <View style={styles.experienceHeader}>
            <Text style={styles.experienceTitle}>{exp.title}</Text>
            <TouchableOpacity onPress={() => {
              setActiveExperience(exp);
              setScreen("editExperience");
            }}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.experienceCompany}>{exp.company}</Text>
          <Text style={styles.experienceDuration}>Duration: {exp.duration}</Text>
          <Text style={styles.experienceLocation}>Location: {exp.location}</Text>
        </View>
      ))}

      <TouchableOpacity 
        style={styles.resetButton}
        onPress={() => handleReset("experience")}
      >
        <Text style={styles.resetButtonText}>Reset Experience</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderEditExperienceScreen = () => (
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.screenTitle}>{activeExperience ? "Edit Experience" : "Add Experience"}</Text>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Employer</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter employer name"
          defaultValue={activeExperience?.company}
          onChangeText={(text) => setActiveExperience(prevState => ({ ...prevState, company: text }))}
        />
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Job Title</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Product designer"
          defaultValue={activeExperience?.title}
          onChangeText={(text) => setActiveExperience(prevState => ({ ...prevState, title: text }))}
        />
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Location</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter location"
          defaultValue={activeExperience?.location}
          onChangeText={(text) => setActiveExperience(prevState => ({ ...prevState, location: text }))}
        />
      </View>
      
      <View style={styles.formSection}>
  <Text style={styles.formLabel}>Duration</Text>
  <View style={styles.durationContainer}>
    <TextInput
      style={styles.durationInput}
      placeholder="Start (MM/YYYY)"
      keyboardType="default"
      maxLength={7}
      defaultValue={activeExperience?.duration ? activeExperience.duration.split(" - ")[0] : ''}
      onChangeText={(text) => {
        const formattedText = text.replace(/[^0-9/]/g, '');
        const endDate = activeExperience?.duration 
          ? activeExperience.duration.split(" - ")[1] 
          : '';
        setActiveExperience(prevState => ({
          ...prevState,
          duration: `${formattedText} - ${endDate}`
        }));
      }}
    />
    <TextInput
      style={styles.durationInput}
      placeholder="End (MM/YYYY)"
      keyboardType="default"
      maxLength={7}
      defaultValue={activeExperience?.duration ? activeExperience.duration.split(" - ")[1] : ''}
      onChangeText={(text) => {
        const formattedText = text.replace(/[^0-9/]/g, '');
        const startDate = activeExperience?.duration 
          ? activeExperience.duration.split(" - ")[0] 
          : '';
        setActiveExperience(prevState => ({
          ...prevState,
          duration: `${startDate} - ${formattedText}`
        }));
      }}
    />
  </View>
</View>

<TouchableOpacity 
  style={styles.saveButton}
  onPress={() => {
    const { title, company, duration, location } = activeExperience;

    if (!title || !company || !duration || !location) {
      Alert.alert("Error", "Please fill all the required fields.");
      return;
    }

    const [startDate, endDate] = duration.split(" - ");
    const dateRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dateRegex.test(startDate)) {
      Alert.alert("Error", "Start date must be in MM/YYYY format.");
      return;
    }
    if (endDate !== "Present" && !dateRegex.test(endDate)) {
      Alert.alert("Error", "End date must be in MM/YYYY format or 'Present'.");
      return;
    }

    const updatedExperience = {
      id: activeExperience.id || Date.now(),
      title: activeExperience.title || '',
      company: activeExperience.company || '',
      duration: activeExperience.duration || '',
      location: activeExperience.location || ''
    };

    if (activeExperience.id) {
      
      setUserData(prevState => ({
        ...prevState,
        experience: prevState.experience.map(exp => 
          exp.id === activeExperience.id ? updatedExperience : exp
        )
      }));
    } else {
      setUserData(prevState => ({
        ...prevState,
        experience: [...prevState.experience, updatedExperience]
      }));
    }

    if (!activeExperience.id || activeExperience.id === userData.experience[0]?.id) {
      setUserData(prevState => ({
        ...prevState,
        title: updatedExperience.title
      }));
    }

    setActiveExperience(null);
    setScreen("experience");
  }}
>
  <Text style={styles.saveButtonText}>Save</Text>
</TouchableOpacity>
    </ScrollView>
  );

  const renderSkillsScreen = () => (
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.screenTitle}>Skills</Text>
      
      <View style={styles.skillsSection}>
        <Text style={styles.skillSectionTitle}>Skill Gap Analysis</Text>
        {userData.skills.skillGap.map((skill, index) => (
          <View key={index} style={styles.skillGapItem}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <Text style={styles.skillLevel}>{skill.level}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.skillsSection}>
        <Text style={styles.skillSectionTitle}>Technical Skills</Text>
        <View style={styles.technicalSkillsContainer}>
          {userData.skills.technical.map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillTagText}>{skill.name}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.addSkillButton}
        onPress={() => setScreen("editSkills")}
      >
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>Add New Skills</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.resetButton}
        onPress={() => handleReset("skills")}
      >
        <Text style={styles.resetButtonText}>Reset Skills</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderEditSkillsScreen = () => (
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.screenTitle}>Skill</Text>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Search skill</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Search for a skill"
          defaultValue={activeSkill?.name}
          onChangeText={(text) => setActiveSkill(prevState => ({ ...prevState, name: text }))}
        />
      </View>
      
      <View style={styles.skillsTagsContainer}>
        <TouchableOpacity style={styles.skillTagSelect}>
          <Text style={styles.skillTagSelectText}>React</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skillTagOutline}>
          <Text style={styles.skillTagOutlineText}>Node.js</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skillTagOutline}>
          <Text style={styles.skillTagOutlineText}>TypeScript</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skillTagOutline}>
          <Text style={styles.skillTagOutlineText}>Python</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={() => {
          if (activeSkill?.name) {
            const newSkill = {
              name: activeSkill.name,
              level: skillLevel
            };
        
            setUserData(prevState => ({
              ...prevState,
              skills: {
                ...prevState.skills,
                technical: [...prevState.skills.technical, { name: activeSkill.name }],
                skillGap: [...prevState.skills.skillGap, newSkill]
              }
            }));
            
            setActiveSkill(null);
            setSkillLevel("Expert");
            setScreen("skills");
          }
        }}
      >

<View style={styles.formSection}>
  <Text style={styles.formLabel}>Skill Level</Text>
  <View style={styles.skillLevelContainer}>
    {["Expert", "Medium", "Low"].map((level) => (
      <TouchableOpacity
        key={level}
        style={[
          styles.skillLevelButton,
          skillLevel === level && styles.skillLevelButtonActive
        ]}
        onPress={() => setSkillLevel(level)}
      >
        <Text style={[
          styles.skillLevelText,
          skillLevel === level && styles.skillLevelTextActive
        ]}>{level}</Text>
      </TouchableOpacity>
    ))}
  </View>
</View>

        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderEducationScreen = () => (
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.screenTitle}>Education</Text>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setScreen("editEducation")}
      >
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>Add New Education</Text>
      </TouchableOpacity>

      {userData.education.map((edu, index) => (
        <View key={index} style={styles.educationItem}>
          <View style={styles.educationHeader}>
            <Text style={styles.educationDegree}>{edu.degree}</Text>
            <TouchableOpacity onPress={() => {
              setActiveEducation(edu);
              setScreen("editEducation");
            }}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.educationUniversity}>{edu.university}</Text>
          <Text style={styles.educationDuration}>Duration: {edu.duration}</Text>
          <Text style={styles.educationLocation}>Location: {edu.location}</Text>
        </View>
      ))}

      <TouchableOpacity 
        onPress={() => {
          if (activeSkill?.name) {
            const newSkill = {
              name: activeSkill.name,
              level: skillLevel
            };
            setUserData(prevState => ({
              ...prevState,
              skills: {
                ...prevState.skills,
                technical: [...prevState.skills.technical, newSkill],
                skillGap: [...prevState.skills.skillGap, newSkill]
              }
            }));
            setActiveSkill(null);
            setSkillLevel("Expert");
            setScreen("skills");
          }
        }}
      >
        <Text style={styles.resetButtonText}>Reset Education</Text>
      </TouchableOpacity>

      <TouchableOpacity 
  style={styles.resetButton}
  onPress={() => handleReset("education")}
>
  <Text style={styles.resetButtonText}>Reset Education</Text>
</TouchableOpacity>

    </ScrollView>
  );

  const renderEditEducationScreen = () => (
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.screenTitle}>{activeEducation ? "Edit Education" : "Add Education"}</Text>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>University</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter university name"
          defaultValue={activeEducation?.university}
          onChangeText={(text) => setActiveEducation(prevState => ({ ...prevState, university: text }))}
        />
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Major</Text>
        <TextInput
  style={styles.textInput}
  placeholder="e.g. Computer Engineering"
  defaultValue={activeEducation?.degree ? activeEducation.degree.split(" of ")[1] : ''}
  onChangeText={(text) => {
    const currentDegree = activeEducation?.degree?.split(" of ")[0] || "Bachelor";
    setActiveEducation(prevState => ({
      ...prevState,
      degree: `${currentDegree} of ${text}`
    }));
  }}
/>
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Degree</Text>
        <TextInput
  style={styles.textInput}
  placeholder="e.g. Master's"
  defaultValue={activeEducation?.degree ? activeEducation.degree.split(" of ")[0] : ''}
  onChangeText={(text) => {
    const currentMajor = activeEducation?.degree?.split(" of ")[1] || "";
    setActiveEducation(prevState => ({
      ...prevState,
      degree: `${text} of ${currentMajor}`
    }));
  }}
/>
      </View>
      
      <View style={styles.formSection}>
  <Text style={styles.formLabel}>Duration</Text>
  <View style={styles.durationContainer}>
    <TextInput
      style={styles.durationInput}
      placeholder="Start (MM/YYYY)"
      keyboardType="numeric"
      maxLength={7}
      defaultValue={activeEducation?.duration ? activeEducation.duration.split(" - ")[0] : ''}
      onChangeText={(text) => {
        const formattedText = text.replace(/[^0-9/]/g, '');
        const endDate = activeEducation?.duration 
          ? activeEducation.duration.split(" - ")[1] 
          : '';
        setActiveEducation(prevState => ({
          ...prevState,
          duration: `${formattedText} - ${endDate}`
        }));
      }}
    />
    <TextInput
      style={styles.durationInput}
      placeholder="End (MM/YYYY)"
      keyboardType="numeric"
      maxLength={7}
      defaultValue={activeEducation?.duration ? activeEducation.duration.split(" - ")[1] : ''}
      onChangeText={(text) => {
        const formattedText = text.replace(/[^0-9/]/g, '');
        const startDate = activeEducation?.duration 
          ? activeEducation.duration.split(" - ")[0] 
          : '';
        setActiveEducation(prevState => ({
          ...prevState,
          duration: `${startDate} - ${formattedText}`
        }));
      }}
    />
  </View>
</View>
      
      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Location</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Canada"
          defaultValue={activeEducation?.location}
          onChangeText={(text) => setActiveEducation(prevState => ({ ...prevState, location: text }))}
        />
      </View>

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={() => {
          const newEducation = {
            id: activeEducation?.id || Date.now(),
            degree: activeEducation?.degree || '',
            university: activeEducation?.university || '',
            duration: activeEducation?.duration || '',
            location: activeEducation?.location || ''
          };
        
          setUserData(prevState => ({
            ...prevState,
            education: activeEducation?.id 
              ? prevState.education.map(edu => edu.id === activeEducation.id ? newEducation : edu)
              : [...prevState.education, newEducation]
          }));
          
          setActiveEducation(null);
          setScreen("education");
        }}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderScreen = () => {
    switch (screen) {
      case "main":
        return renderMainScreen();
      case "details":
        return renderDetailsScreen();
      case "editDetails":
        return renderEditDetailsScreen();
      case "experience":
        return renderExperienceScreen();
      case "editExperience":
        return renderEditExperienceScreen();
      case "skills":
        return renderSkillsScreen();
      case "editSkills":
        return renderEditSkillsScreen();
      case "education":
        return renderEducationScreen();
      case "editEducation":
        return renderEditEducationScreen();
      default:
        return renderMainScreen();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {screen !== "main" && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              if (screen === "editDetails") setScreen("details");
              else if (screen === "editExperience") setScreen("experience");
              else if (screen === "editSkills") setScreen("skills");
              else if (screen === "editEducation") setScreen("education");
              else setScreen("main");
            }}
          >
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
        )}

        {renderScreen()}
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
  },
  backButton: {
    padding: 10,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#e0e0e0",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 5,
  },
  profileTitle: {
    fontSize: 16,
    color: "#666",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  formValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  durationInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: "48%",
  },
  editButton: {
    backgroundColor: "#0A0E17",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginTop: 20,
  },
  editButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#0A0E17",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  addButtonIcon: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  experienceItem: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  editLink: {
    fontSize: 14,
    color: "#2563eb",
  },
  experienceCompany: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  experienceDuration: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  experienceLocation: {
    fontSize: 14,
    color: "#666",
  },
  educationItem: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: "600",
  },
  educationUniversity: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  educationDuration: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  educationLocation: {
    fontSize: 14,
    color: "#666",
  },
  skillsSection: {
    marginBottom: 24,
  },
  skillSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  skillGapItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  skillName: {
    fontSize: 14,
    fontWeight: "500",
  },
  skillLevel: {
    fontSize: 14,
    color: "#2563eb",
  },
  technicalSkillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillTag: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  skillTagText: {
    fontSize: 14,
    color: "#495057",
  },
  addSkillButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  skillsTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
    marginBottom: 20,
  },
  skillTagSelect: {
    backgroundColor: "#e1e9ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  skillTagSelectText: {
    fontSize: 14,
    color: "#2563eb",
  },
  skillTagOutline: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  skillTagOutlineText: {
    fontSize: 14,
    color: "#666",
  },
  durationInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: "48%",
  },
  skillLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  skillLevelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  skillLevelButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  skillLevelText: {
    color: '#666',
  },
  skillLevelTextActive: {
    color: 'white',
  },
  resetButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  resetButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  }
});

export default ProfileScreen;