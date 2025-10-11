// frontend/src/components/dashboard/PostCard.js
import React from "react";
import { formatDistanceToNow } from "date-fns";
import "./PostCard.css";

const PostCard = ({ post }) => {
  return (
    <div className="post-card card">
      <div className="post-header">
        <span className="post-club">{post.club_name}</span>
        <span className="post-time">
          {formatDistanceToNow(new Date(post.created_at))} ago
        </span>
      </div>
      <p className="post-content">{post.content}</p>
      <div className="post-author">by @{post.author_username}</div>
    </div>
  );
};
export default PostCard;
