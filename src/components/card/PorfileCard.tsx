import React, {useState} from 'react';
import Image from 'next/image';
import {Plus, Activity} from 'lucide-react';

interface ProfileCardProps {
    profilePicSrc: string;
    userName: string;
    userHandle: string;
    category: string;
    postCount: number;
    followerCount: number;
    followingCount: number;
    channelIcons: React.ReactNode[];
}

const ProfileCard: React.FC<ProfileCardProps> = ({
                                                     profilePicSrc,
                                                     userName,
                                                     userHandle,
                                                     category,
                                                     postCount,
                                                     followerCount,
                                                     followingCount,
                                                     channelIcons,
                                                 }) => {

    const [isFollowing, setIsFollowing] = useState(false);

    const handleFollowClick = () => {
        setIsFollowing(prev => !prev);
    };

    const cardClasses = "flex flex-col items-center bg-white rounded-xl shadow-lg overflow-hidden min-w-[225px] min-h-[400px] p-6 text-center";

    return (
        <div className={cardClasses}>

            {/* PROFILE IMAGE */}
            <Image
                src={profilePicSrc}
                alt={userName}
                width={80}
                height={80}
                className="rounded-full object-cover shadow-md mb-3"
            />

            {/* NAME AND CATEGORY */}
            <div className="mb-6">
                <h3 className="font-bold text-xl text-gray-900">{userName}</h3>
                <p className="text-sm text-gray-500 mb-2">{userHandle}</p>
                <div className="flex items-center justify-center text-sm text-yellow-600 space-x-1">
                    <Activity size={14} className="text-yellow-500"/>
                    <span className="text-gray-700">{category}</span>
                </div>
            </div>

            {/* MEDIA */}
            <div className="mb-30 w-full">
                <p className="text-sm font-medium text-gray-600 mb-2">Active channels</p>
                <div className="flex justify-center space-x-3 text-gray-700">
                    {channelIcons.map((Icon, index) => (
                        <div key={index} className="w-4 h-4">{Icon}</div>
                    ))}
                </div>
            </div>

            {/* STATS */}
            <div className="flex justify-between w-full mb-5 px-2">
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-900">{postCount}</span>
                    <span className="text-[11px] text-gray-500 font-medium">Posts</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-900">{followerCount}</span>
                    <span className="text-[11px] text-gray-500 font-medium">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-900">{followingCount}</span>
                    <span className="text-[11px] text-gray-500 font-medium">Following</span>
                </div>
            </div>
            {/* ACTION BUTTONS */}
            <div className="flex justify-center space-x-3 w-full">
                <button
                    className="flex-1 px-4 py-2 text-indigo-700 border border-indigo-700 rounded-full font-semibold hover:bg-indigo-50 transition duration-150"
                    onClick={() => console.log('Visit localhost:3000/u/userName')} // TODO Implement visit profile
                >
                    View profile
                </button>
                <button
                    className={`flex-1 flex items-center justify-center px-2 py-2 text-xs rounded-full font-semibold transition duration-150 ${
                        isFollowing
                            ? 'bg-gray-100 text-gray-600 border border-gray-200'
                            : 'bg-indigo-700 text-white hover:bg-indigo-800'
                    }`}
                    onClick={handleFollowClick}
                >
                    {isFollowing ? 'Following' : (
                        <span className="flex items-center">
                            Follow <Plus size={14} className="ml-1"/>
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProfileCard;