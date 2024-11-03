
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Swal from "sweetalert2";

export default function About() {
    const [currentPosts, setCurrentPosts] = useState([]);
    const [showCreateModel, setShowCreateModel] = useState(false);
    const [newPostContent, setNewPostContent] = useState("");
    const [updatePostId, setUpdatePostId] = useState(0);

    const router = useRouter();
    const username = document.cookie.split(";").find(row => row.startsWith("username=")).split("=")[1];

    const fetchPostsByUser = async () => {
        try{
            const response = await fetch(`http://localhost:5000/posts/by_user/${username}`, {
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
        fetchPostsByUser();
    }, []); // every time a new post is updated or deleted, fetch the posts again

    const handleDeleteClick = async(id: number) => {
        try{
            //TODO delete all the comments of the post first
            const response = await fetch(`http://localhost:5000/posts/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                console.log("Post deleted successfully");
                await fetchPostsByUser();
            } else {
                console.error("Failed to delete post");
            }
        }
        catch (error) {
            console.error("Failed to delete post", error);
        }
    };

    const handleCommentClick = (id: number) => {
        router.push(`/posts/${id}`);
    }

    const handleUpdateClick = (id: number) => {
        setUpdatePostId(id);
        setShowCreateModel(true);
    }

    const sensitiveCheck = (text: string) => {
        const sensitiveWords = ["Trump", "Harris"];
        return sensitiveWords.some(word => text.includes(word));
    }

    const handleConfirmUpdate = async(id:number) => {
        if (sensitiveCheck(newPostContent)) {
            Swal.fire({
                icon: "error",
                title: "Sensitive Content",
                text: "Please do not input sensitive content",
            });
            return;
        }
        try{
            const comments = currentPosts.find(post => post.pid === id).comments;
            console.log(comments);
            const response = await fetch(`http://localhost:5000/posts/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    content: newPostContent,
                    username: username,
                    comments: comments
                }),
            });
            if (response.ok) {
                console.log("Post updated successfully");
                await fetchPostsByUser();
                setNewPostContent("");
                setUpdatePostId(0);
                setShowCreateModel(false);
            } else {
                console.error("Failed to update post");
            }
        }
        catch (error) {
            console.error("Failed to update post", error);
        }
    }

    const handleCancelUpdate = () => {
        setNewPostContent("");
        setUpdatePostId(0);
        setShowCreateModel(false);
    }
    
    return (
        <div className="flex flex-col p-4 justify-center items-center">
            <table className="w-4/5 bg-white">
                <thead>
                    <tr>
                        <th className="py-2 w-1/2">Content</th>
                        <th className="py-2 w-1/12">Comments</th>
                        <th className="py-2 w-1/4">Update Time</th>
                        <th className="py-2 w-1/6">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPosts.map(post => (
                        <tr key={post.pid} className="text-center">
                            <td className="border px-4 py-2 w-1/2 break-words">{post.content}</td>
                            <td className="border px-4 py-2 w-1/12">
                                <button onClick={() => handleCommentClick(post.pid)}
                                    className="w-2/3 items-center text-white bg-blue-500 rounded mx-auto block hover:bg-blue-700 transition-colors">
                                    {post.comments}
                                </button>
                            </td>
                            <td className="border px-4 py-2 w-1/4">{post.updated_at}</td>
                            <td className="border px-4 py-2 w-1/6">
                                <div className="flex justify-center items-center">
                                    <button 
                                        onClick={() => {
                                            handleUpdateClick(post.pid);
                                        }}
                                        className="w-1/2 text-white bg-green-500 rounded mx-2 block hover:bg-green-700 transition-colors"
                                    >
                                        Update
                                    </button>

                                    <button 
                                        onClick={() => {
                                            handleDeleteClick(post.pid);
                                        }}
                                        className="w-1/2 text-white bg-red-500 rounded mx-2 block hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="w-4/5 flex justify-center items-center mt-4">
                <button 
                    onClick={() => {
                        router.push("/");
                    }}
                className="w-1/12 items-center text-white bg-blue-500 rounded mx-auto block hover:bg-blue-700 transition-colors"
                >
                    Back
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
                            onClick={() => {
                                handleConfirmUpdate(updatePostId);
                            }}
                            className="w-1/6 text-white bg-green-500 rounded mx-4 block hover:bg-green-700 transition-colors"
                        >
                        Confirm
                        </button>
                        <button 
                            onClick={handleCancelUpdate}
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