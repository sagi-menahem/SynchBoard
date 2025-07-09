// File: frontend/src/pages/BoardListPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link
import { getBoards } from '../services/boardService';
import type { Board } from '../types/board.types';
import Modal from '../components/common/Modal';
import CreateBoardForm from '../components/board/CreateBoardForm';

const BoardListPage: React.FC = () => {
    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // ... (fetchBoards logic remains the same)
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

    const handleBoardCreated = (newBoard: Board) => {
        setBoards(prevBoards => [...prevBoards, newBoard]);
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
                <button onClick={() => setIsModalOpen(true)} style={createButtonStyle}>
                    + Create New Board
                </button>
            </div>

            {boards.length > 0 ? (
                // Changed from <ul> to <div> for easier styling of links
                <div className="board-list"> 
                    {boards.map(board => (
                        // 2. Wrap each board item with a Link component
                        <Link key={board.id} to={`/board/${board.id}`} style={linkStyle}>
                            <div style={boardCardStyle}>
                                <h2>{board.name}</h2>
                                <p>{board.description || 'No description available.'}</p>
                                {board.isAdmin && <span style={{ color: 'green' }}> (Admin)</span>}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p>You are not a member of any boards yet. Click "Create New Board" to get started!</p>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <CreateBoardForm 
                    onBoardCreated={handleBoardCreated}
                    onClose={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

// Styles
const createButtonStyle: React.CSSProperties = {
    padding: '10px 15px', border: 'none', borderRadius: '4px', backgroundColor: '#646cff',
    color: 'white', cursor: 'pointer', fontSize: '1rem'
};

const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: 'inherit'
};

const boardCardStyle: React.CSSProperties = {
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    transition: 'background-color 0.2s'
};


export default BoardListPage;