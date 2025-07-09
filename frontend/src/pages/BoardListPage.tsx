// File: frontend/src/pages/BoardListPage.tsx

import React, { useState, useEffect } from 'react';
import { getBoards } from '../services/boardService';
import type { Board } from '../types/board.types';

const BoardListPage: React.FC = () => {
    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                // Fetch the boards from the API
                const userBoards = await getBoards();
                setBoards(userBoards);
            } catch (err) {
                // If an error occurs, update the error state
                setError('Failed to fetch boards. Please try again later.');
                console.error(err);
            } finally {
                // In any case, stop the loading indicator
                setIsLoading(false);
            }
        };

        fetchBoards();
    }, []); // The empty array ensures this effect runs only once when the component mounts

    // Conditional Rendering Logic
    if (isLoading) {
        return <div>Loading your boards...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div>
            <h1>My Boards</h1>
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
                <p>You are not a member of any boards yet.</p>
            )}
            {/* TODO: Add a button or form to create a new board */}
        </div>
    );
};

export default BoardListPage;