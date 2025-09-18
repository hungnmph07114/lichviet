// This file is used to set up the environment variables for the browser.
// In a real-world application, this should be handled by a build system
// or your hosting provider's secret management.

if (!window.process) {
  window.process = {};
}
if (!window.process.env) {
  window.process.env = {};
}

// --- PASTE YOUR GEMINI API KEY HERE ---
// 1. Get your API key from Google AI Studio (https://aistudio.google.com/).
// 2. Replace "YOUR_API_KEY_HERE" with your actual key.
window.process.env.API_KEY = "AIzaSyAenUGKMv0maeHVCMvzbNgjG1HahuJ9518";
