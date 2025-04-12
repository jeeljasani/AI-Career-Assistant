import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for clipboard icon

const FullPreviewModal = ({ visible, onClose, coverLetterText, jobTitle }) => {
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(coverLetterText);
    alert("Cover letter copied to clipboard!");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: "90%", backgroundColor: "white", padding: 20, borderRadius: 10 }}>

          {/* Header with Job Title and Copy Icon */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", flex: 1 }}>{jobTitle}</Text>
            <TouchableOpacity onPress={copyToClipboard}>
              <Ionicons name="clipboard-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Cover Letter Content */}
          <ScrollView style={{ maxHeight: 600 }}>
            <Text style={{ fontSize: 16, lineHeight: 24 }}>{coverLetterText}</Text>
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{ backgroundColor: "#2563eb", padding: 10, borderRadius: 5, alignItems: "center", marginTop: 15 }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FullPreviewModal;