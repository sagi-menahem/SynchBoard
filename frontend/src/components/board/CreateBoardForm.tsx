// File: frontend/src/components/board/CreateBoardForm.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { createBoard } from '../../services/boardService';
import type { Board, CreateBoardRequest } from '../../types/board.types';

interface CreateBoardFormProps {
  onBoardCreated: (newBoard: Board) => void;
  onClose: () => void;
}

const CreateBoardForm: React.FC<CreateBoardFormProps> = ({ onBoardCreated, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (name.trim().length < 3) {
      setError('Board name must be at least 3 characters long.');
      return;
    }

    setIsSubmitting(true);
    const boardData: CreateBoardRequest = { name, description };

    try {
      const newBoard = await createBoard(boardData);
      onBoardCreated(newBoard);
    } catch (err) {
      let errorMessage = 'Failed to create board. Please try again.';
      
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.data && typeof err.response.data.message === 'string') {
          errorMessage = err.response.data.message;
        }
      }
      
      console.error(err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create a New Board</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div>
        <label htmlFor="board-name">Board Name</label>
        <input
          id="board-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Q3 Project Planning"
          required
          style={inputStyle}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label htmlFor="board-description">Description (Optional)</label>
        <textarea
          id="board-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this board about?"
          rows={3}
          style={inputStyle}
        />
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button type="button" onClick={onClose} disabled={isSubmitting} style={buttonStyle.secondary}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} style={buttonStyle.primary}>
          {isSubmitting ? 'Creating...' : 'Create Board'}
        </button>
      </div>
    </form>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  marginTop: '4px',
  boxSizing: 'border-box',
  backgroundColor: '#444',
  border: '1px solid #666',
  borderRadius: '4px',
  color: '#fff'
};

const buttonStyle = {
  primary: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#646cff',
    color: 'white',
    cursor: 'pointer'
  },
  secondary: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#555',
    color: 'white',
    cursor: 'pointer'
  }
};

export default CreateBoardForm;