import React from 'react'
import { useState } from 'react'

export default function CommentForm( { initialValue = " ", loading, error, onSubmit, autoFocus=false }) {
    const [message, setMessage] = useState(initialValue); 

    function handleSubmit(e) {
        e.preventDefault()
        onSubmit(message).then( ()=> setMessage(""))
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className='comment-form-row'>
                <textarea 
                    className='message-input' 
                    autoFocus= {autoFocus}
                    onChange={e => setMessage(e.target.value)}
                    value={message}
                    />
                <button 
                    className='btn'
                    type='submit' 
                    disabled={loading}
                >
                    {loading ? "Loading": "Post"}
                </button>
            </div>
            <div className='error-msg' >
                {error}
            </div>
        </form>
    )
}
