import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import EventsList from '../../components/EventsComponents/EventsList';
import EventsDetails from '../../components/EventsComponents/EventsDetails';

const EventsPage = () => {
  const [Events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const { id } = useParams();

  useEffect(() => {
    fetch('http://localhost:8000/events/get')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8000/events/get/${id}`)
        .then(res => res.json())
        .then(data => setSelectedEvent(data))
        .catch(err => console.error(err));
    }
  }, [id]);

  const filteredEvents = filterCategory === 'all'
    ? Events
    : Events.filter(d => d.category.toLowerCase() === filterCategory.toLowerCase());

  return (
    <div>
      <Header />
      <div className='min-w-[320px] mt-4 grid grid-cols-7 w-[95%] h-fit mx-auto bg-gray-50 rounded-lg shadow-md'>
        <div className='col-span-2 w-full flex items-start justify-center p-3'>
          <EventsList 
            events={filteredEvents}
            setSelectedEvent={setSelectedEvent}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
          />
        </div>

        <div className='col-span-5 flex items-start justify-center p-3'>
          <EventsDetails 
            events={selectedEvent}
          />
        </div>
      </div>
    </div>
  );
};

export default EventsPage;