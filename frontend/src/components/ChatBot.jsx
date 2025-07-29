import { useRef, useEffect, useState } from "react";
import { Send, Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import axios from "axios";

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!hasInitialized && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hi! I'm your MyShow assistant. I can help you:\n\n• Find movie recommendations\n• Get movie details and ratings\n• Check your bookings\n• Discover trending films\n• Find showtimes and theaters\n\nWhat movie are you looking for today?",
        },
      ]);
      setHasInitialized(true);
    }
  }, [hasInitialized, messages.length]);

  const quickSuggestions = [
    { label: "📽️ Popular movies", value: "Show me popular movies" },
    { label: "🎭 Horror movies", value: "Suggest horror movies for tonight" },
    { label: "📅 My bookings", value: "What are my upcoming bookings?" },
    { label: "🔥 Trending now", value: "What movies are trending now?" },
  ];

  const handleInputChange = (e) => setInput(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = {
      id: Date.now() + "-user",
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("hii");
      const response = await axios.post("/api/chat", { message: input });
      console.log(response);

      const data = response.data;
      console.log(data);

      const assistantMessage = {
        id: Date.now() + "-assistant",
        role: "assistant",
        content: data.reply || "Sorry, I couldn't get a response.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.log(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + "-assistant",
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (value) => {
    setInput(value);
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 100);
  };

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">MyShow Assistant</h3>
            <p className="text-xs text-gray-500">
              🤖 AI-powered movie recommendations
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0 hover:cursor-pointer"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div key={message.id || index}>
            {message.role === "assistant" && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 max-w-[85%]">
                    <div className="text-sm text-gray-800 whitespace-pre-line">
                      <div className="flex flex-wrap gap-1 text-gray-300">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            h1: ({ node, ...props }) => (
                              <h1
                                className="text-2xl font-bold mt-6 mb-4 text-black"
                                {...props}
                              />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2
                                className="text-xl font-semibold mt-4 mb-3 text-black"
                                {...props}
                              />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3
                                className="text-lg font-medium mt-3 mb-2 text-black"
                                {...props}
                              />
                            ),
                            p: ({ node, ...props }) => {
                              // Avoid wrapping <pre> inside <p>
                              if (
                                node.children &&
                                node.children.length === 1 &&
                                node.children[0].tagName === "pre"
                              ) {
                                return <>{props.children}</>;
                              }
                              return (
                                <p
                                  className="text-base text-gray-900 my-2 leading-relaxed"
                                  {...props}
                                />
                              );
                            },
                            ul: ({ node, ...props }) => (
                              <ul
                                className="list-disc pl-6 text-gray-300 my-2"
                                {...props}
                              />
                            ),
                            li: ({ node, ...props }) => (
                              <li
                                className="mb-1 leading-relaxed text-black"
                                {...props}
                              />
                            ),
                            // strong: ({ node, ...props }) => (
                            //   <strong
                            //     className="font-semibold text-white"
                            //     {...props}
                            //   />
                            // ),
                            em: ({ node, ...props }) => (
                              <em className="italic text-gray-950" {...props} />
                            ),
                            code: ({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) => {
                              return inline ? (
                                <code
                                  className="bg-zinc-700 px-1 py-0.5 rounded text-orange-300 font-mono text-sm"
                                  {...props}
                                >
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-zinc-900 p-4 my-4 rounded-lg overflow-auto text-sm">
                                  <code
                                    className="text-orange-50 font-mono"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                </pre>
                              );
                            },
                            blockquote: ({ node, ...props }) => (
                              <blockquote
                                className="border-l-4 border-zinc-950 pl-4 italic text-gray-400 my-4"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 ml-1">
                    {getCurrentTime()}
                  </div>
                </div>
              </div>
            )}

            {message.role === "user" && (
              <div className="flex items-start space-x-3 justify-end">
                <div className="flex-1 flex justify-end">
                  <div className="bg-blue-500 text-white rounded-lg p-3 shadow-sm max-w-[85%]">
                    <div className="text-sm">{message.content}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSuggestion(suggestion.value)}
                className="text-xs bg-white hover:bg-gray-100 border-gray-300 text-gray-700 h-8"
                disabled={isLoading}
              >
                {suggestion.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about movies, showtimes, or bookings..."
            className="flex-1 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 text-sm focus:bg-white"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
