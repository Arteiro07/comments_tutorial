import React from 'react'
import Comment from './Comment.jsx'

export default function CommentList({comments}) {
  return comments.map((comment) => (
    <div key={comment.id} className="comment-stack">
        <Comment {...comment}/>
    </div>
  ))
}
