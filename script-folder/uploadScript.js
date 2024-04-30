
import fetch from 'node-fetch';
import * as path from 'path';
import * as fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
// Function to login and obtain access token
async function loginAndGetAccessToken() {
  try {
    const response = await fetch(
      `${process.env.API_URL}/auth-service/auth/login-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "jira_automation@rakuten.com",
          password: "test123!@#",
          client_id: "pms_webapp",
          client_secret: "saqw21!@",
        }),
      }
    );
    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error("Error logging in:", error.message);
    throw error;
  }
}

// Function to upload a single file
async function uploadFile(accessToken, filePath) {
  try {
    const fileName = path.basename(filePath); // Extract filename from the filePath

    var form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const response = await fetch(
      `${process.env.API_URL}/import-facade/ai/fileupload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    const data = await response.json();
    return { fileName, ...data };

  } catch (error) {
    console.error("Error uploading file:", error.message);
    throw error;
  }
}

// Main function to iterate through MP4 files and upload them
async function uploadMP4Files() {
  try {
    // Login and obtain access token
    const accessToken = await loginAndGetAccessToken();

    // Directory containing MP4 files
    const directoryPath = "../VIDEOS";

    // Read all files in the directory
    const files = fs.readdirSync(directoryPath);

    // Iterate through each file
    const uploadResults = [];

    for (const file of files) {
      const filePath = path.join(directoryPath, file);

      // Upload the file
      const uploadResult = await uploadFile(accessToken, filePath);
      uploadResults.push(uploadResult);

      console.log("Uploaded file:", uploadResult);
    }

    fs.writeFileSync('output.txt', JSON.stringify(uploadResults, null, 2));
    console.log("Upload results written to output.txt");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Call the main function
uploadMP4Files();
