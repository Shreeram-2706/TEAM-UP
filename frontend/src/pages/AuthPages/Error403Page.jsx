import { useNavigate } from 'react-router-dom';
import Error403Img from '../../assets/Error403.png';

const NoAccess = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white text-center p-6">
            <img src={Error403Img} alt="403 Forbidden" className="w-72 mb-6 float-animation" />
            <h1 className="text-6xl font-bold text-sky-600">403</h1>
            <p className="text-xl text-gray-600 mt-2">Access Denied</p>
            <p className="text-md text-gray-500 mt-1">You do not have permission to view this page.</p>
            <button 
                onClick={() => navigate('/dashboard')} 
                className="mt-6 px-6 py-3 bg-sky-500 text-white rounded-lg shadow-md hover:bg-sky-600 transition-all"
            >
                Go to my dashboard
            </button>
        </div>
    );
};

export default NoAccess;
