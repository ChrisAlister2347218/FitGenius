import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAm3l2aZOszxwqLn4b7q-ptDrFDwbcerLU';
const genAI = new GoogleGenerativeAI(API_KEY);

const PythonML = () => {
  const [selectedFunction, setSelectedFunction] = useState('AI Assistant ChatBot');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [activityLevel, setActivityLevel] = useState('Sedentary');
  const [goals, setGoals] = useState('Loss Weight');
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [bloodPressure, setBloodPressure] = useState(120);
  const [sugarLevel, setSugarLevel] = useState(80);
  const [foodAllergy, setFoodAllergy] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [imageAnalysisMessages, setImageAnalysisMessages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Add this ref for chat container
  const chatContainerRef = useRef(null);

  // Add scroll effect after messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Add useEffect to reset chat when preferences change
  useEffect(() => {
    setChatMessages([{
      role: 'assistant',
      content: "Namaste! I'm your AI fitness trainer. How can I help you today?"
    }]);
  }, [gender, age, weight, height, activityLevel, goals, dietaryRestrictions, bloodPressure, sugarLevel, foodAllergy]);

  const handleStartConversation = () => {
    setChatMessages([
      {
        role: 'assistant',
        content: 'Hi! I\'m your AI fitness assistant. Ask me anything about fitness!'
      }
    ]);
  };

  const handleSendMessage = async (message) => {
    try {
      setLoading(true);
      const newMessages = [...chatMessages, { role: 'user', content: message }];
      setChatMessages(newMessages);

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are a friendly Indian fitness trainer. Keep responses mediumly short and precise (2-3 lines). Use Indian English and be encouraging. Don't use greetings unless it's the first message.

Client Profile:
Age: ${age}, Gender: ${gender}
Weight: ${weight}kg, Height: ${height}cm
Activity: ${activityLevel}
Goal: ${goals}
Health: BP ${bloodPressure}, Sugar ${sugarLevel}
Restrictions: ${dietaryRestrictions.join(', ') || 'None'}
Allergies: ${foodAllergy || 'None'}

Question: "${message}"

Give a direct response with:
1. Clear answer
2. Quick practical tip
3. Brief encouragement`;

      const chat = model.startChat({
        history: [],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100, // Reduced for even shorter responses
        }
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();
      
      setChatMessages([
        ...newMessages,
        { role: 'assistant', content: text }
      ]);

    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I apologize for the interruption! As your fitness trainer, I want to make sure I give you the best advice. Could you please ask your question again?"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageAnalysis = async () => {
    if (!imageFile) return;

    try {
      setLoading(true);
      const base64Image = await fileToGenerativePart(imageFile);

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze this food image in simple, conversational language. Based on the person's details:

Age: ${age} years
Gender: ${gender}
Current weight: ${weight} kg
Height: ${height} cm
Activity level: ${activityLevel}
Goal: ${goals}
Dietary restrictions: ${dietaryRestrictions.join(', ')}
Blood pressure: ${bloodPressure}
Sugar level: ${sugarLevel}
Food allergies: ${foodAllergy}

Please provide a clear analysis using this exact format without any special characters or markdown:

Foods and Approximate Calories:
(List each food item and calories on new lines, no bullet points or special characters)

Total Meal Calories:
(Single number or range)

Recommendation:
(Start with YES or NO, then explain in a conversational way)

Frequency Advice:
(Simple guidance on how often this food can be eaten, if at all)

Keep the language natural and friendly - like a nutritionist having a conversation. Do not use any special characters like *, **, or bullet points.`;

      // Generate content using the SDK
      const result = await model.generateContent({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }]
      });

      const response = await result.response;
      const text = response.text();

      setImageAnalysisMessages([
        ...imageAnalysisMessages,
        { role: 'assistant', content: text }
      ]);

    } catch (error) {
      console.error('Image analysis error:', error);
      setImageAnalysisMessages([
        {
          role: 'assistant',
          content: `Sorry, I couldn't analyze the image. Please try uploading it again.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fileToGenerativePart = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageAnalysisMessages([]);
    }
  };

  const handleError = (error) => {
    console.error('Component Error:', error);
    return (
      <div className="text-red-500 p-4">
        Something went wrong. Please refresh the page and try again.
      </div>
    );
  };

  const ChatMessages = () => (
    <div 
      ref={chatContainerRef}
      className="space-y-4 mb-6 h-[500px] overflow-y-auto p-4 bg-gray-50 rounded-xl scroll-smooth"
    >
      {chatMessages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
        >
          <div
            className={`max-w-[80%] p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500 text-white ml-4'
                : 'bg-white shadow-md border border-gray-100 mr-4'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-500 text-sm">🏋️</span>
                </div>
              )}
              <p className="text-sm font-medium">
                {message.role === 'user' ? 'You' : 'AI Trainer'}
              </p>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="md:w-1/3 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Personal Information</h2>
          <div className="space-y-4">
            {/* Functionality Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Select Functionality</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    value="AI Assistant ChatBot"
                    checked={selectedFunction === 'AI Assistant ChatBot'}
                    onChange={(e) => setSelectedFunction(e.target.value)}
                    className="form-radio text-blue-600"
                  />
                  <span className="text-gray-700">AI Assistant ChatBot</span>
                </label>
                <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    value="AI Vision for Dietary"
                    checked={selectedFunction === 'AI Vision for Dietary'}
                    onChange={(e) => setSelectedFunction(e.target.value)}
                    className="form-radio text-blue-600"
                  />
                  <span className="text-gray-700">AI Vision for Dietary Analysis</span>
                </label>
              </div>
            </div>

            {/* Personal Details Form */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Sedentary">Sedentary</option>
                  <option value="Lightly Active">Lightly Active</option>
                  <option value="Moderately Active">Moderately Active</option>
                  <option value="Very Active">Very Active</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
                <select
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Loss Weight">Loss Weight</option>
                  <option value="Maintain Weight">Maintain Weight</option>
                  <option value="Gain Weight">Gain Weight</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:w-2/3 bg-white rounded-xl shadow-lg p-6">
          {selectedFunction === 'AI Assistant ChatBot' ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">AI Fitness Assistant</h2>
              
              {/* Chat Messages */}
              <ChatMessages />

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.target.elements.messageInput;
                  const message = input.value.trim();
                  if (message) {
                    handleSendMessage(message);
                    input.value = '';
                  }
                }}
                className="mt-4"
              >
                <div className="flex gap-2">
                  <input
                    name="messageInput"
                    type="text"
                    placeholder="Ask me about fitness, nutrition, or your health goals..."
                    className="flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoComplete="off"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">AI Vision for Dietary Analysis</h2>
              
              {/* Image Upload */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center space-y-4"
                  >
                    <div className="text-blue-600 hover:text-blue-700">
                      <svg className="mx-auto h-16 w-16" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-lg font-medium text-gray-700">Upload Food Image</p>
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    </div>
                  </label>
                </div>

                {/* Image Preview and Analysis */}
                {imagePreview && (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden">
                      <img src={imagePreview} alt="Food" className="w-full h-auto" />
                    </div>
                    <button
                      onClick={handleImageAnalysis}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Analyze Image
                    </button>
                  </div>
                )}
              </div>

              {/* Analysis Results */}
              <div className="space-y-6">
                {imageAnalysisMessages.map((message, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <div className="prose max-w-none space-y-4">
                      {message.content.split('\n').map((line, i) => {
                        // Handle section headers
                        if (line.match(/^(Foods and Approximate Calories|Total Meal Calories|Recommendation|Frequency Advice):/)) {
                          return (
                            <h3 key={i} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                              {line}
                            </h3>
                          );
                        }

                        // Handle regular text with proper spacing
                        if (line.trim()) {
                          return (
                            <p key={i} className="text-gray-700 leading-relaxed pl-4">
                              {line}
                            </p>
                          );
                        }

                        return null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <div className="text-gray-700">Processing...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PythonML;
