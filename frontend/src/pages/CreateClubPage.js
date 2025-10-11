
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import './CreateClubPage.css';

function CreateClubPage() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const navigate = useNavigate();
    const api = useApi();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/clubs/', { name, description });
            navigate('/clubs');
        } catch (error) {
            console.error('Failed to create club', error);
        }
    };

    return (
        <div className="create-club-layout">
            <div className="main-content">
                <div className="content-header">
                    <div className="header-left">
                        <h2>Create New Club</h2>
                        <p className="subtitle">Start a new club and invite members</p>
                    </div>
                </div>
                <div className="create-club-form">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Club Name</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                required 
                                placeholder="Enter your club name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea 
                                id="description" 
                                name="description" 
                                required 
                                placeholder="Describe what your club is about..." 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/clubs')}>Cancel</button>
                            <button type="submit" className="btn-submit">Create Club</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateClubPage;
