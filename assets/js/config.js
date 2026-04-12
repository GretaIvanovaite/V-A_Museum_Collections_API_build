/* Local configuration — AI chatbot API key
 *
 * This file is only needed when running the prototype locally.
 * On the live Netlify site the token is stored as an environment variable
 * and this file is ignored.
 *
 * To use the AI chatbot locally:
 *   1. Replace YOUR_KEY_HERE below with your Hugging Face API token.
 *   2. In assets/js/chat.js, follow the instructions near the HF_MODEL lines
 *      to switch from the Netlify function to the local Hugging Face URL.
 */
var HUGGING_FACE_TOKEN = 'YOUR_KEY_HERE';
