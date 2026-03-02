import React, { useState, useEffect, useContext } from 'react';
import { HeartIcon, Heart, LinkIcon, CalendarIcon } from 'lucide-react';
import StockImg from '../../assets/stockimg.jpg';
import { format } from 'date-fns';
import userContext from '../../Context/UserContext';

const EventDetails = ({ events }) => {
  const [currentEvent, setCurrentEvent] = useState(events);
  const [isLiking, setIsLiking] = useState(false);
  const { user } = useContext(userContext);
  const userId = user?.id;

  useEffect(() => {
    if (events) {
      setCurrentEvent(events);
    }
  }, [events]);

  const hasLiked = currentEvent?.likedBy?.includes(userId);

  const handleLike = async () => {
    if (!userId) {
      console.error('User must be logged in to like events');
      return;
    }

    setIsLiking(true);
    try {
      const endpoint = hasLiked ? 'unlike' : 'like';
      const response = await fetch(`http://localhost:8000/events/${endpoint}/${currentEvent._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setCurrentEvent(updatedEvent);
      } else {
        console.error('Failed to update like status');
      }
    } catch (error) {
      console.error('Error updating like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  if (!currentEvent) {
    return (
      <div className="w-full text-center text-gray-500 text-md py-20">
        Please select an events to view its details.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto items-start w-full">
      {/* Image Section */}
      <div className="w-full md:w-[35%] h-[525px] relative rounded-lg shadow-md overflow-hidden">
        <img
          src={currentEvent.image ? `http://localhost:8000/${currentEvent.image}` : StockImg}
          alt="background blur"
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          onError={(e) => {
            e.target.src = StockImg;
          }}
        />
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <img
            src={currentEvent.image ? `http://localhost:8000/${currentEvent.image}` : StockImg}
            alt="events cover"
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.target.src = StockImg;
            }}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="no-scrollbar w-full md:flex-1 bg-white rounded-2xl shadow-lg p-6 max-h-[550px] overflow-y-auto">
        {/* Header */}
        <div className="border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{currentEvent.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium">Posted by:</span>
              <span className="ml-1 text-gray-800">{currentEvent.username}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>{formatDate(currentEvent.createdAt)}</span>
            </div>
            <div className="bg-sky-100 text-sky-800 px-2 py-1 rounded-full text-xs font-medium">
              {currentEvent.category}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
          <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
            {currentEvent.description}
          </div>
        </div>

        {currentEvent.link && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-lg">🔗</span>
            <a
              href={currentEvent.link}
              target="_blank"
              rel="noopener noreferrer"
              title={currentEvent.link}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 text-sm rounded-md transition-all"
            >
              <LinkIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate max-w-[300px]">{currentEvent.link}</span>
            </a>
          </div>
        )}

        {/* Like Button */}
        <div className="flex items-center mt-6">
          <button
            onClick={handleLike}
            disabled={!userId || isLiking}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              hasLiked ? 'text-pink-600' : 'text-gray-600'
            } hover:bg-gray-100 transition-colors ${
              !userId ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={hasLiked ? 'Unlike events' : 'Like events'}
          >
            {hasLiked ? (
              <Heart className="h-5 w-5 fill-pink-600" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
            <span className="font-medium">
              {currentEvent.likes || 0} {currentEvent.likes === 1 ? 'Like' : 'Likes'}
            </span>
            {isLiking && <span className="ml-2 text-sm">Processing...</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;