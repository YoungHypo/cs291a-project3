"use client";

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format, set } from 'date-fns';
import Swal from 'sweetalert2';

export default function Post() {
  const router = useRouter();
  const { id } = useParams();
  const pid = Number(id);

  const username = document.cookie.split(";").find(row => row.startsWith("username=")).split("=")[1];

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postData, setPostData] = useState({});

  const fetchPostsDate  = async () => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${pid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        const formattedData = {
          ...data,
          updated_at: formatDate(data.updated_at),
        };
        setPostData(formattedData);
      } else {
        console.error("Failed to fetch post data");
        router.push("/404");
      }
    } catch (error) {
      console.error("Failed to fetch post data", error);
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/comments/by_post/${pid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map(comment => ({
          ...comment,
          updated_at: formatDate(comment.updated_at),
        }));
        setComments(formattedData);
      } else {
        console.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    }
  }


  const formatDate = (isoSting: string) => {
    return format(new Date(isoSting), "yyyy-MM-dd HH:mm:ss");
  }

  useEffect(() => {
    fetchPostsDate();
    fetchComments();
  }, []);

  const sensitiveCheck = (text: string) => {
    const sensitiveWords = ["Trump", "Harris"];
    return sensitiveWords.some(word => text.includes(word));
  }

  const handleAddComment = async() => {
    if (sensitiveCheck(newComment)) {
      Swal.fire({
        icon: "error",
        title: "Sensitive Content",
        text: "Please avoid using sensitive words",
      });
      setNewComment("");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          username: username,
          pid: pid,
        }),
      });
      if (response.ok) {
        console.log("Comment added successfully");
        await incrementCommentCount();
        await fetchComments();
        setNewComment("");
      } else {
        console.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  const incrementCommentCount = async() => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${pid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: postData.content,
          username: postData.username,
          comments: String(Number(postData.comments) + 1),
        }),
      });
      if (response.ok) {
        console.log("Comment count increased successfully");
        await fetchPostsDate();
      } else {
        console.error("Failed to increase comment count");
      }
    } catch (error) {
      console.error("Failed to increase comment count", error);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="bg-white p-4 mt-10 rounded shadow-md">
        <h2 className="text-xl font-bold">Post Content - user: {postData.username}</h2>
        <p className="text-l text-gray-600 p-2">{postData.content}</p>
        <h3 className="text-lg font-Semibold mt-4">Comments</h3>
        {comments.map(comment => (
          <div key={comment.cid} className="bg-gray-100 p-2 rounded mt-2">
            <p className="text-sm text-gray-600">{comment.username}: {comment.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Add a comment..."
        />
      </div>

      <div className="flex justify-center items-center mt-4">
        <button
          onClick={handleAddComment}
          className="flex justify-center w-1/3 mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-700 transition-colors"
        >
          Add Comment
        </button>
      </div>

      <div className="flex justify-center items-center mt-4">
        <button
          onClick={() => router.back()}
          className="flex justify-center w-1/3 mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
