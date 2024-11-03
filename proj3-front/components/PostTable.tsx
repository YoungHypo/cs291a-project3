"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Swal from "sweetalert2";

export default function PostTable() {
    const [ searchItem, setSearchItem ] = useState("");
    const [ currentPosts, setCurrentPosts ] = useState([]);
    const [showCreateModel, setShowCreateModel] = useState(false);
    const [newPostContent, setNewPostContent] = useState("");

    const router = useRouter();
    const username = document.cookie.split(";").find(row => row.startsWith("username=")).split("=")[1];

    const fetchPosts = async () => {
        try{
            const response = await fetch("http://localhost:5000/posts", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                const formattedData = data.map(post => ({
                    ...post,
                    updated_at: formatDate(post.updated_at),
                }));
                setCurrentPosts(formattedData);
            } else {
                console.error("Failed to fetch posts");
            }
        }
        catch (error) {
            console.error("Failed to fetch posts", error);
        }
    }

    const formatDate = (isoSting: string) => {
        return format(new Date(isoSting), "yyyy-MM-dd HH:mm:ss");
    }

    useEffect(() => {
        fetchPosts();
    }, []); // every time a new post is created, fetch the posts again

    const searchPostsByName = async() => {
        try{
            if (searchItem.trim()) {
                const response = await fetch(`http://localhost:5000/posts/by_user/${searchItem}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    const formattedData = data.map(post => ({
                        ...post,
                        updated_at: formatDate(post.updated_at),
                    }));
                    setCurrentPosts(formattedData);
                }
                else {
                    console.error("Failed to search posts");
                }
            }
            else{
                await fetchPosts();
            }
        }
        catch (error) {
            console.error("Failed to search posts", error); 
        }
    }   

    const handleCommentClick = (id: number) => {
        router.push(`/posts/${id}`);
    }

    const handleCreateClick = () => {
        setShowCreateModel(true);
    }

    const sensitiveCheck = (text: string) => {
        const sensitiveWords = ["Trump", "Harris"];
        return sensitiveWords.some(word => text.includes(word));
    }

    const handleConfirmCreate = async() => {
        if (sensitiveCheck(newPostContent)) {
            Swal.fire({
                icon: "error",
                title: "Sensitive Words Detected",
                text: "Please do not use sensitive words in your post",
            });
            return;
        }
        try{
            const newPost = {
                content: newPostContent,
                username: username,
                comments: "0",
            };
            const response = await fetch("http://localhost:5000/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newPost),
            });
            if (response.ok) {
                await fetchPosts();
                setNewPostContent("");
                setShowCreateModel(false);
                console.log("Post created successfully");
            }
            else {
                console.error("Failed to create post");
            }
        }
        catch (error) {
            console.error("Failed to create post", error);
        }
    };

    const handleCancelCreate = () => {
        setNewPostContent("");
        setShowCreateModel(false);
    };

    const handleMyClick = () => {
        router.push("/about");
    }

  return (
    <div className="flex flex-col p-4 justify-center items-center">
        <div className="w-4/5 flex items-center">
            <input 
                type="text" 
                placeholder="Search by username" 
                value={searchItem}
                onChange={e => setSearchItem(e.target.value)}
                className="w-1/6 h-8 p-2 my-4 ml-60 border border-gray-300 rounded" 
            />
            <button 
                onClick={searchPostsByName}
                className="w-1/12 text-white bg-green-500 rounded ml-5 block hover:bg-green-700 transition-colors"
            >
                Search
            </button>

            <button
                onClick={handleCreateClick}
                className="w-1/12 text-white bg-green-500 rounded ml-40 block hover:bg-green-700 transition-colors"
            >
                Create
            </button>

            <button
                onClick={handleMyClick}
                className="w-1/12 text-white bg-blue-500 rounded ml-10 block hover:bg-blue-700 transition-colors"
            >
                My
            </button>
        </div>
        <table className="w-4/5 bg-white">
            <thead>
                <tr>
                    <th className="py-2 w-1/2">Content</th>
                    <th className="py-2 w-1/6">Poster</th>
                    <th className="py-2 w-1/12">Comments</th>
                    <th className="py-2 w-1/4">Update Time</th>
                </tr>
            </thead>
            <tbody>
                {currentPosts.map(post => (
                <tr key={post.pid} className="text-center">
                    <td className="border px-4 py-2 w-1/2 break-words">{post.content}</td>
                    <td className="border px-4 py-2 w-1/6">{post.username}</td>
                    <td className="border px-4 py-2 w-1/12">
                        <button onClick={() => handleCommentClick(post.pid)}
                          className="w-2/3 items-center text-white bg-blue-500 rounded mx-auto block hover:bg-blue-700 transition-colors">
                            {post.comments}
                        </button>
                    </td>
                    <td className="border px-4 py-2 w-1/4">{post.updated_at}</td>
                </tr>
            ))}
        </tbody>
      </table>

      <div className="w-4/5 flex justify-center items-center mt-4">
        <button 
            onClick={() => {
                document.cookie = "username=; path=/; max-age=0";
                window.location.reload();
            }}
            className="w-1/12 items-center text-white bg-blue-500 rounded mx-auto block hover:bg-blue-700 transition-colors"
        >
          Log out
        </button>
    </div>

    {showCreateModel && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded shadow-md w-1/3">
                <h2 className="flex justify-center text-xl font-bold mb-2">Create New Post</h2>
                <textarea 
                    placeholder="Enter Post Content"
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    className="w-full h-32 border border-gray-300 rounded p-2"
                ></textarea>
                <div className="flex justify-center items-center mt-4">
                    <button 
                        onClick={handleConfirmCreate}
                        className="w-1/6 text-white bg-green-500 rounded mx-4 block hover:bg-green-700 transition-colors"
                    >
                        Confirm
                    </button>
                    <button 
                        onClick={handleCancelCreate}
                        className="w-1/6 text-white bg-green-500 rounded mx-4 block hover:bg-green-700 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )}
  </div>
  );
}
