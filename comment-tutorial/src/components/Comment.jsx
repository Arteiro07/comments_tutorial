import React from 'react'
import IconBtn from './IconBtn'
import {FaHeart, FaTrash, FaEdit, FaReply, FaRegHeart} from "react-icons/fa"
import { usePost } from '../context/PostContext'
import CommentList from './CommentList'
import { useState } from 'react'
import CommentForm from './CommentForm'
import { useAsyncFn } from '../hooks/useAsync'
import { createComment, deleteComment, toggleCommentLike, updateComment } from '../services/comments'
import { useUser } from '../hooks/useUser'

export default function Comment({id, message, user, createdAt, likeCount, likedByMe}) {
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
  const { post, getReplies, createLocalComment, updateLocalComment, deleteLocalComment, toggleLocalCommentLike} = usePost();
  const childComments = getReplies(id);
  const [areChildrenHidden, setAreChildrenHidden] = useState(false);
  const createCommentFn = useAsyncFn(createComment)
  const updateCommentFn = useAsyncFn(updateComment)
  const deleteCommentFn = useAsyncFn(deleteComment)
  const toggleCommentLikeFn = useAsyncFn(toggleCommentLike)
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const currentUser = useUser()

  function onCommentDelete(){
    return deleteCommentFn
    .execute({ postId: post.id, id })
    .then(comment=> {
      deleteLocalComment(comment.id)
    })
  }

  function onCommentReply(message){
    return createCommentFn
      .execute({ postId: post.id, message, parentId:id })
      .then(comment=> {
        setIsReplying(false)
        createLocalComment(comment)
      })
  }

  function onCommentUpdate(message){
    return updateCommentFn
      .execute({ postId: post.id, message, id })
      .then(comment=> {
        setIsEditing(false)
        updateLocalComment(id, comment.message)
      })
  }

  function onToggleCommentLike(){
    return toggleCommentLikeFn
    .execute({ id, postId:post.id})
    .then(({addLike})=> toggleLocalCommentLike (id, addLike))
  }

  return (
    <>
      <div className='comment'>
        <div className='header'>
          <span className='name'>{user.name}</span>
          <span className='date'>{dateFormatter.format(Date.parse(createdAt))}</span>
        </div>
        {isEditing ? (
            <CommentForm 
              autoFocus 
              initialValue={message}
              onSubmit={onCommentUpdate}
              loading={updateCommentFn.loading}
              error={updateCommentFn.error}
            />
          ) : (
            <div className='message'>
              {message}
            </div>
          )
        }
        <div className='footer'>
          <IconBtn
            Icon={likedByMe? FaHeart : FaRegHeart} 
            aria-label={likedByMe?"Unike" : "Like"}
            onClick={onToggleCommentLike}
            disabled={toggleCommentLikeFn.loading}
          >
            {likeCount}
          </IconBtn>
          <IconBtn 
            Icon={FaReply} 
            aria-label={isReplying? "Cancel Reply" :"Reply"}
            isActive={isReplying}
            onClick={()=>{ setIsReplying(prev => !prev)}}
          />
          {user.id === currentUser.id && (
            <>
              <IconBtn 
                Icon={FaEdit} 
                aria-label={isEditing? "Cancel Edit" :"Edit"}
                isActive={isEditing}
                onClick={()=>{ setIsEditing(prev => !prev)}}
              />
              <IconBtn 
                disabled={deleteCommentFn.loading}
                Icon={FaTrash} 
                aria-label="Delete" 
                color="danger"
                onClick={()=>onCommentDelete()}
              /> 
            </>
          )}
        </div>
        {deleteCommentFn.error && (

          <div className="error-msg mt-1 ">{deleteCommentFn.error}</div>
        )}
      </div>
      {isReplying && (
        <div className='mt-1 ml-3'>
          <CommentForm 
            autoFocus
            onSubmit = {onCommentReply}
            loading = {createCommentFn.loading}
            error = {createCommentFn.error}
          ></CommentForm>
        </div>
      )}
      {childComments?.length > 0 &&(
        <>
          <div className={`nested-comments-stack ${areChildrenHidden ? "hide" : ""}`}>
            <button className='collapse-line' aria-label='Hide-Replies' onClick={()=>setAreChildrenHidden((hidden)=>!hidden)}/>
            <div className='nested-comments'>
              <CommentList comments={childComments}/>
            </div>
          </div>
          <button className={`btn mt-1 ${!areChildrenHidden ? "hide" :" " }`} onClick={()=>setAreChildrenHidden(false)}> ShowReplies</button>
        </>
      )}
    </>
  )
}