import { useState, useRef, useEffect } from 'react';
import WeatherModal from "./components/WeatherModal";
import SearchModal from "./components/SearchModal";
import TodoModal from "./components/TodoModal";

import { motion } from "framer-motion";
import './App.css';

import dialTone from './assets/dial-tone.mp3';
import {addTodo, deleteTodo, fetchTodos, updateTodo, editTodo} from "./api/todoApi.js";

function App() {
    const [isCalling, setIsCalling] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [todoList, setTodoList] = useState(null);
    const localStreamRef = useRef(null);
    const dataChannelRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const dialAudioRef = useRef(new Audio(dialTone));
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (todoList !== null) {
            fetchTodos();
        }
    }, [todoList]);

    const startCall = async () => {
        setIsCalling(true);
        dialAudioRef.current.play();

        // try {
            // Fetch the session token
            const tokenResponse = await fetch(API_URL + "/session");
            const data = await tokenResponse.json();
            const EPHEMERAL_KEY = data.client_secret.value;

            // Create a peer connection
            const peerConnection = new RTCPeerConnection();
            peerConnectionRef.current = peerConnection;

            // Set up remote audio playback
            const audioEl = document.createElement('audio');
            audioEl.autoplay = true;
            document.body.appendChild(audioEl); // Append to the DOM
            peerConnectionRef.current.ontrack = (e) => {
                audioEl.srcObject = e.streams[0];
            };

            // Capture local audio and add to peer connection
            localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current.getTracks().forEach((track) => peerConnectionRef.current.addTrack(track, localStreamRef.current));

            // Set up data channel
            dataChannelRef.current = peerConnectionRef.current.createDataChannel('oai-events');

            // Add event listeners to the data channel
            dataChannelRef.current.onopen = async () => {
                await configureData();

                dialAudioRef.current.pause();
            };
            dataChannelRef.current.onmessage = async (e) => {
                const msg = JSON.parse(e.data);

                if (msg.type === "response.function_call_arguments.done") {
                    const fn = msg.name;
                    const args = JSON.parse(msg.arguments);

                    if (fn === "get_weather") {
                        const weatherResponse = await fetchWeather(args.location);

                        setWeatherData(weatherResponse);

                        const event = {
                            type: "conversation.item.create",
                            item: {
                                type: "function_call_output",
                                call_id: msg.call_id,
                                output: JSON.stringify(weatherResponse),
                            },
                        };

                        await dataChannelRef.current.send(JSON.stringify(event));
                    }

                    if (msg.name === "search_tavily") {
                        const args = JSON.parse(msg.arguments);

                        try {
                            const results = await fetchTavilySearch(args.query);

                            setSearchResults(results);

                            const event = {
                                type: "conversation.item.create",
                                item: {
                                    type: "function_call_output",
                                    call_id: msg.call_id,
                                    output: JSON.stringify(results),
                                },
                            };
                            dataChannelRef.current.send(JSON.stringify(event));
                        } catch (error) {
                            console.error("Error processing search request:", error);
                        }
                    }

                    if (fn === "add_todo") {
                        const todoResponse = await addTodo(args.title, args.description);
                        let todos = await fetchTodos();
                        setTodoList(todos)

                        const event = {
                            type: "conversation.item.create",
                            item: {
                                type: "function_call_output",
                                call_id: msg.call_id,
                                output: JSON.stringify(todoResponse),
                            },
                        };

                        await dataChannelRef.current.send(JSON.stringify(event));
                    }

                    if (fn === "get_todos") {
                        const todosResponse = await fetchTodos();

                        setTodoList(todosResponse);

                        const event = {
                            type: "conversation.item.create",
                            item: {
                                type: "function_call_output",
                                call_id: msg.call_id,
                                output: JSON.stringify(todosResponse),
                            },
                        };

                        await dataChannelRef.current.send(JSON.stringify(event));
                    }

                    if (fn === "update_todo") {
                        await updateTodo(args.id, args.completed);
                        let todos = await fetchTodos();
                        setTodoList(todos)

                        const event = {
                            type: "conversation.item.create",
                            item: {
                                type: "function_call_output",
                                call_id: msg.call_id,
                                output: JSON.stringify({ success: true, message: "Todo update successfully" }),
                            },
                        };

                        await dataChannelRef.current.send(JSON.stringify(event));
                    }

                    if (fn === "edit_todo") {
                        await editTodo(args.id, args.title, args.description);
                        let todos = await fetchTodos();
                        setTodoList(todos)

                        const event = {
                            type: "conversation.item.create",
                            item: {
                                type: "function_call_output",
                                call_id: msg.call_id,
                                output: JSON.stringify({ success: true, message: "Todo updated successfully" }),
                            },
                        };

                        await dataChannelRef.current.send(JSON.stringify(event));
                    }

                    if (fn === "delete_todo") {
                        await deleteTodo(args.id);
                        let todos = await fetchTodos();
                        setTodoList(todos)

                        const event = {
                            type: "conversation.item.create",
                            item: {
                                type: "function_call_output",
                                call_id: msg.call_id,
                                output: JSON.stringify({ success: true, message: "Todo deleted successfully" }),
                            },
                        };

                        await dataChannelRef.current.send(JSON.stringify(event));
                    }
                }
            };

            // Create SDP offer
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);

            // Send SDP offer to the server
            const sdpResponse = await fetch(API_URL + "/webrtc-offer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${EPHEMERAL_KEY}`,
                },
                body: JSON.stringify({ sdp: offer.sdp }),
            });

            if (!sdpResponse.ok) {
                throw new Error('Failed to send SDP offer');
            }

            // Get and set the remote SDP answer
            const answer = await sdpResponse.json();
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        // } catch (error) {
        //     console.error('Error during call:', error);
        //     stopCall();
        // }
    };

    const stopCall = () => {
        setIsCalling(false);
        dialAudioRef.current.pause();

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Stop local media streams
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }

        // Close data channel
        if (dataChannelRef.current) {
            dataChannelRef.current.close();
            dataChannelRef.current = null;
        }

    };

    const configureData = async () => {
      const event = {
        type: 'session.update', // Session update event
        session: {
            modalities: ['text', 'audio'], // Supported interaction modes: text and audio
            // Provide functional tools, pay attention to the names of these tools corresponding to the keys in the above fns object
            tools: [
                {
                    type: "function",
                    name: "search_tavily",
                    description: "Make a search",
                    parameters: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "The search query",
                            },
                        },
                        required: ["query"],
                    },
                },
                {
                  type: 'function',
                  name: "get_weather",
                  description: "Get the current weather for a given location",
                  parameters: {
                      type: "object",
                      properties: {
                          location: {
                              type: "string",
                              description: "The name of the city or location to get the weather for",
                          },
                      },
                      required: ["location"],
                  },
                },
                {
                    type: "function",
                    name: "add_todo",
                    description: "Add a new todo task",
                    parameters: {
                        type: "object",
                        properties: {
                            title: { type: "string", description: "The title of the task" },
                            description: { type: "string", description: "The description of the task" },
                        },
                        required: ["title"],
                    },
                },
                {
                    type: "function",
                    name: "get_todos",
                    description: "Retrieve all todos",
                    parameters: {},
                },
                {
                    type: "function",
                    name: "update_todo",
                    description: "Update the completion status of a todo task",
                    parameters: {
                        type: "object",
                        properties: {
                            id: { type: "integer", description: "The ID of the task to update" },
                            completed: { type: "boolean", description: "Whether the task is completed" },
                        },
                        required: ["id", "completed"],
                    },
                },
                {
                    type: "function",
                    name: "edit_todo",
                    description: "Edit the title and description of a todo task",
                    parameters: {
                        type: "object",
                        properties: {
                            id: { type: "integer", description: "The ID of the task to update" },
                            title: { type: "string", description: "The new title of the task" },
                            description: { type: "string", description: "The new description of the task" },
                        },
                        required: ["id", "title", "description"],
                    },
                },
                {
                    type: "function",
                    name: "delete_todo",
                    description: "Delete a todo task",
                    parameters: {
                        type: "object",
                        properties: {
                            id: { type: "integer", description: "The ID of the task to delete" },
                        },
                        required: ["id"],
                    },
                },
            ]
        }
      };

      await dataChannelRef.current.send(JSON.stringify(event));
    };

    const fetchWeather = async (location) => {
      try {
          const response = await fetch(`${API_URL}/weather?location=${encodeURIComponent(location)}`);
          if (!response.ok) throw new Error("Failed to fetch weather data");
          return await response.json();
      } catch (error) {
          console.error("Error fetching weather:", error);
          return { error: "Unable to fetch weather data" };
      }
    };

    const fetchTavilySearch = async (query) => {
        try {
            const response = await fetch(API_URL + "/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error("Search request failed");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching search results:", error);
            return [];
        }
    };

    return (
        <div
            className="relative flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
            <motion.h1
                className="text-5xl font-extrabold text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg"
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8}}
            >
                AI Assistant
            </motion.h1>

            <motion.div
                className="text-lg text-center text-gray-300 mt-4 max-w-2xl"
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.3, duration: 0.8}}
            >
                Your smart assistant can help you with various tasks:
                <ul className="mt-2 list-disc list-inside text-gray-400">
                    <li>🔍 <strong>Search the Web:</strong> Instantly find information online.</li>
                    <li>☀️ <strong>Check Weather:</strong> Get real-time weather updates for any location.</li>
                    <li>✅ <strong>Manage Tasks:</strong> Add, update, and remove to-do items effortlessly.</li>
                    <li>🎙️ <strong>Voice Interaction:</strong> Engage with the assistant through seamless voice
                        commands.
                    </li>
                </ul>
            </motion.div>

            <motion.div
                className="max-w-lg w-full bg-gray-800/90 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden mt-8 p-6 flex flex-col items-center"
                initial={{opacity: 0, scale: 0.9}}
                animate={{opacity: 1, scale: 1}}
                transition={{delay: 0.5, duration: 0.8}}
            >
                <motion.button
                    className={`w-full py-4 px-8 text-xl font-bold rounded-lg transition duration-300 focus:outline-none focus:ring-4 ${
                        isCalling ? "bg-red-500 hover:bg-red-600 focus:ring-red-700" : "bg-green-500 hover:bg-green-600 focus:ring-green-700"
                    }`}
                    onClick={isCalling ? stopCall : startCall}
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                >
                    {isCalling ? "End Call" : "Start Call"}
                </motion.button>
            </motion.div>

            {/* Модальные окна */}
            {weatherData && <WeatherModal weather={weatherData} onClose={() => setWeatherData(null)}/>}
            {searchResults && <SearchModal results={searchResults} onClose={() => setSearchResults(null)}/>}
            {todoList !== null && (
                <TodoModal
                    todos={todoList}
                    onClose={() => setTodoList(null)}
                    onUpdate={(id, title, description) => updateTodo(id, title, description)}
                    onDelete={(id) => deleteTodo(id)}
                />
            )}
        </div>
    );
}

export default App;
