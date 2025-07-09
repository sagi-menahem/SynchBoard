// File: frontend/src/pages/BoardListPage.tsx

import React, { useState, useEffect } from 'react';
import { getBoards } from '../services/boardService';
import type { Board } from '../types/board.types';
import Modal from '../components/common/Modal'; // 1. Import Modal
import CreateBoardForm from '../components/board/CreateBoardForm'; // 2. Import CreateBoardForm

const BoardListPage: React.FC = () => {
    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // 3. State for modal visibility

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const userBoards = await getBoards();
                setBoards(userBoards);
            } catch (err) {
                setError('Failed to fetch boards. Please try again later.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBoards();
    }, []);

    // 4. Handler for when a new board is successfully created
    const handleBoardCreated = (newBoard: Board) => {
        // Add the new board to the existing list
        setBoards(prevBoards => [...prevBoards, newBoard]);
        // Close the modal
        setIsModalOpen(false);
    };

    if (isLoading) {
        return <div>Loading your boards...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>My Boards</h1>
                {/* 5. Button to open the modal */}
                <button onClick={() => setIsModalOpen(true)} style={createButtonStyle}>
                    + Create New Board
                </button>
            </div>

            {boards.length > 0 ? (
                <ul>
                    {boards.map(board => (
                        <li key={board.id}>
                            <h2>{board.name}</h2>
                            <p>{board.description || 'No description available.'}</p>
                            <small>Last updated: {new Date(board.lastModifiedDate).toLocaleString()}</small>
                            {board.isAdmin && <span style={{ marginLeft: '10px', color: 'green' }}> (Admin)</span>}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>You are not a member of any boards yet. Click "Create New Board" to get started!</p>
            )}

            {/* 6. Render the Modal and the Form inside it */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <CreateBoardForm 
                    onBoardCreated={handleBoardCreated}
                    onClose={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

const createButtonStyle: React.CSSProperties = {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#646cff',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem'
};

export default BoardListPage;