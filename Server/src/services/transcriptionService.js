import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const generateSummaryWithGemini = asyncHandler(async (transcript) => {
    
    const apiKey = process.env.GEMINI_API_KEY
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const response = await axios.post(
        endpoint,
        {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `Summarize the following meeting transcript. Include a brief summary, key points, and action items:\n\n${transcript}`
                        }
                    ]
                }
            ]
        },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );

    const text = response.data.candidates[0].content.parts[0].text;

    const sections = text.split('\n\n');
    const summary = sections[0];
    const keyPoints = sections[1]?.replace('Key Points:', '').split('\n- ').filter(Boolean) || [];
    const actionItems = sections[2]?.replace('Action Items:', '').split('\n- ').filter(Boolean) || [];

    return {
        summary,
        keyPoints,
        actionItems
    };
});