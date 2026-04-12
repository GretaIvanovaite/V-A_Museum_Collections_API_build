# C&A Collections — V&A Museum Collections Prototype

A final year undergraduate project for the BSc Web Design, Development and Analytics degree at Edge Hill University (CIS3425). The prototype is a redesigned browsing interface for the Victoria and Albert Museum's collections, built against the V&A Collections API. It allows users to explore museum objects by origin, collection, and theme, and includes an AI-powered conversational assistant for collection discovery.

---

## Live Site

The prototype is deployed and fully functional at:

**https://collectionsarchives.netlify.app/**

> The interface is optimised for desktop displays (1280px and wider). JavaScript must be enabled in your browser for the prototype to fetch and render live museum data.

---

## Running Locally

Because the project uses native web technologies (HTML, CSS, and vanilla JavaScript) with no framework dependencies, it can be run locally with no build step required.

1. Extract the provided `V-A_Museum_Collections_API_build.zip` file.
2. Open the extracted folder on your computer.
3. Double-click `index.html` to open the prototype in your default web browser (ensure JavaScript is enabled).

---

## AI Chatbot Configuration

The conversational assistant uses the Hugging Face Inference API.

**Live site:** The API key is stored as an environment variable (`HUGGING_FACE_TOKEN`) in the Netlify hosting dashboard. The chat feature works immediately on the live link above — no configuration needed.

**Local environment:** To use the AI chat locally, two steps are required:

1. Open `assets/js/config.js` and replace `YOUR_KEY_HERE` with your Hugging Face API token.

2. In `assets/js/chat.js`, find the `HF_MODEL` lines (marked with a comment) and swap them — comment out the `const` (Netlify) line and uncomment the `var` (Hugging Face) line beneath it.

---

## Tech Stack

- HTML, CSS, vanilla JavaScript (no frameworks)
- V&A Collections API
- Hugging Face Inference API (AI chatbot)
- Netlify (hosting and serverless functions)
