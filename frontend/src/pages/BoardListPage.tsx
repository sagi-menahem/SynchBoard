// File: frontend/src/pages/BoardListPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBoards } from '../services/boardService';
import type { Board } from '../types/board.types';
import Modal from '../components/common/Modal';
import CreateBoardForm from '../components/board/CreateBoardForm';
import Button from '../components/common/Button';

const BoardListPage: React.FC = () => {
    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        <div style={{ width: '100%', maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>My Boards</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    + Create New Board
                </Button>
            </div>

            {boards.length > 0 ? (
                <div className="board-list">
                    {boards.map(board => (
                        <Link key={board.id} to={`/board/${board.id}`} style={linkStyle}>
                            <div style={boardCardStyle}>
                                <h2>{board.name}</h2>
                                <p>{board.description || 'No description available.'}</p>
                                {board.isAdmin && <span style={{ color: '#4ade80' }}> (Admin)</span>}
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
const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: 'inherit'
};

const boardCardStyle: React.CSSProperties = {
    backgroundColor: '#2f2f2f',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    transition: 'background-color 0.2s, transform 0.2s',
};

export default BoardListPage;