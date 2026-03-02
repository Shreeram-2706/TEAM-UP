import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TestImg from "../../assets/logo.png";

const UpcomingEvents = () => {
  const [events, setevents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchevents = async () => {
      try {
        const response = await fetch("http://localhost:8000/events/get");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setevents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchevents();
  }, []);

  const sortedevents = [...events].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const handleeventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="grid-col-2 col-span-2 mx-2 justify-center gap-3">
      <div className="announcement col-span-2 bg-white p-3 rounded-md border border-gray-200 h-[40vh] md:h-[80vh]">
        <div className="flex justify-between p-1 items-center">
          <h2 className="latestAnnouncement border-b text-left text-lg text-sky-600 font-bold">
            Live & Upcoming Events
          </h2>
        </div>

        <div className="announcement-list overflow-y-auto h-[90%]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center pt-14 h-full">
              <p className="text-gray-500">Failed to load events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No events available</p>
            </div>
          ) : (
            sortedevents.map((event) => (
              <div
                key={event._id}
                className="bg-white p-2 m-2 rounded-md shadow-sm flex duration-300 hover:bg-sky-50 hover:shadow-md cursor-pointer"
                onClick={() => handleeventClick(event._id)}
              >
                <div className="img-container w-1/4">
                  <img
                    src={
                      event.image
                        ? `http://localhost:8000/${event.image}`
                        : TestImg
                    }
                    alt="event"
                    className="w-full h-auto max-h-[80px] object-cover rounded-md"
                  />
                </div>
                <div className="content-container w-3/4 p-1 ml-2">
                  <h3 className="text-sm font-bold mb-1 min-h-[40px] line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex justify-between gap-1 flex-wrap">
                    <p className="text-xs text-black px-2 my-1 mx-auto rounded-md py-1 bg-sky-50">
                      {event.category}
                    </p>
                    <p className="text-xs text-black px-2 my-1 mx-auto rounded-md py-1 bg-sky-50">
                      {formatTimeAgo(event.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;