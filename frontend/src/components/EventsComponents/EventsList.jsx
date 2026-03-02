import React from 'react';
import TestImg from '../../assets/stockimg.jpg';
import { useNavigate } from 'react-router-dom';

const EventList = ({ events, setSelectedEvent, filterCategory, setFilterCategory }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    navigate(`/events/${event._id}`);
  };

  return (
    <div className='col-span-2 h-full flex'>
      <div className='h-[520px] w-full bg-white shadow-sm rounded-lg p-2'>
        <div className='mb-4 px-3 flex items-center justify-between border-b pb-2'>
          <h2 className='text-lg font-semibold text-sky-600'>Events</h2>
          <select
            className="filter w-40 text-black font-light text-sm p-1 border border-gray-300 rounded"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Paper Presentation">Paper Presentation</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div className='event-list w-[350px] overflow-y-auto h-[85%] pr-1'>
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event._id}
                className='p-2 mb-2 bg-white rounded-md shadow-sm hover:bg-sky-50 cursor-pointer flex gap-3'
                onClick={() => handleEventClick(event)}
              >
                <img
                  src={event.image ? `http://localhost:8000/${event.image}` : TestImg}
                  alt='event'
                  className='w-14 h-14 rounded-md object-cover'
                  onError={(e) => {
                    e.target.src = TestImg;
                  }}
                />
                <div className='w-full'>
                  <h3 className='text-sm font-semibold mb-1'>{event.title}</h3>
                  <div className='flex justify-between text-xs text-gray-600'>
                    <p className='bg-sky-100 px-2 py-0.5 rounded'>{event.category}</p>
                    <p className='text-gray-400'>{formatDate(event.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className='text-center text-gray-500 mt-10'>No events available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventList;