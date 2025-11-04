import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { Poll, PollOption } from '../../types';
import Spinner from '../../components/Spinner';

const PollCard: React.FC<{ poll: Poll; onVote: (pollId: string, optionId: string) => void; votedPolls: string[] }> = ({ poll, onVote, votedPolls }) => {
    const hasVoted = votedPolls.includes(poll.id);
    const totalVotes = poll.poll_options.reduce((sum, option) => sum + option.votes, 0);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{poll.question}</h2>
            <div className="space-y-3">
                {poll.poll_options.map(option => {
                    const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0;
                    return (
                        <div key={option.id}>
                            {hasVoted ? (
                                <div className="w-full">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-base font-medium text-gray-700">{option.option_text}</span>
                                        <span className="text-sm font-medium text-gray-700">{option.votes} Suara ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => onVote(poll.id, option.id)}
                                    className="w-full text-left p-3 bg-gray-100 hover:bg-blue-100 border border-gray-200 rounded-lg transition-colors"
                                >
                                    {option.option_text}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            {hasVoted && <p className="text-sm text-gray-500 mt-4 text-center">Total Suara: {totalVotes}</p>}
        </div>
    );
};

const PollsPage: React.FC = () => {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [votedPolls, setVotedPolls] = useState<string[]>([]);

    useEffect(() => {
        const storedVotes = JSON.parse(localStorage.getItem('voted_polls') || '[]');
        setVotedPolls(storedVotes);
    }, []);
    
    const fetchPolls = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('polls')
            .select('*, poll_options(*)')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (data) {
            setPolls(data);
        }
        if (error) console.error("Error fetching polls:", error);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPolls();
    }, [fetchPolls]);

    const handleVote = async (pollId: string, optionId: string) => {
        // Prevent re-voting
        if (votedPolls.includes(pollId)) return;

        // Call RPC to increment vote
        const { error } = await supabase.rpc('increment_vote', { option_id: optionId });

        if (error) {
            alert("Gagal memberikan suara: " + error.message);
            return;
        }

        // Update local storage
        const updatedVotedPolls = [...votedPolls, pollId];
        localStorage.setItem('voted_polls', JSON.stringify(updatedVotedPolls));
        setVotedPolls(updatedVotedPolls);
        
        // Refresh polls to show results
        fetchPolls();
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900">Polling Siswa</h1>
                    <p className="mt-4 text-lg text-gray-600">Berikan suaramu dan bantu kami membuat keputusan!</p>
                </div>

                {loading ? (
                    <Spinner />
                ) : (
                    <div className="max-w-2xl mx-auto space-y-8">
                        {polls.length > 0 ? (
                            polls.map(poll => (
                                <PollCard key={poll.id} poll={poll} onVote={handleVote} votedPolls={votedPolls} />
                            ))
                        ) : (
                             <div className="text-center bg-white p-10 rounded-lg shadow-md">
                                <h3 className="text-xl text-gray-700">Tidak ada polling yang aktif saat ini.</h3>
                                <p className="text-gray-500 mt-2">Silakan cek kembali nanti!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PollsPage;