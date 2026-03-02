import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

const skillOptions = [
  { value: 'HTML', label: 'HTML' },
  { value: 'CSS', label: 'CSS' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'React', label: 'React' },
  { value: 'Vue.js', label: 'Vue.js' },
  { value: 'Next.js', label: 'Next.js' },
  { value: 'Node.js', label: 'Node.js' },
  { value: 'Express.js', label: 'Express.js' },
  { value: 'Python', label: 'Python' },
  { value: 'Django', label: 'Django' },
  { value: 'Flask', label: 'Flask' },
  { value: 'Java', label: 'Java' },
  { value: 'Spring Boot', label: 'Spring Boot' },
  { value: 'C++', label: 'C++' },
  { value: 'MySQL', label: 'MySQL' },
  { value: 'MongoDB', label: 'MongoDB' },
  { value: 'Firebase', label: 'Firebase' },
  { value: 'Git', label: 'Git' },
  { value: 'GitHub', label: 'GitHub' },
  { value: 'Figma', label: 'Figma' },
  { value: 'Canva', label: 'Canva' },
  { value: 'REST API', label: 'REST API' },
  { value: 'GraphQL', label: 'GraphQL' },
  { value: 'Linux', label: 'Linux' },
  { value: 'AWS', label: 'AWS' },
  { value: 'Docker', label: 'Docker' },
  { value: 'Postman', label: 'Postman' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Deep Learning', label: 'Deep Learning' },
  { value: 'NLP', label: 'NLP' },
  { value: 'TensorFlow', label: 'TensorFlow' },
  { value: 'OpenCV', label: 'OpenCV' },
  { value: 'Data Structures', label: 'Data Structures' },
  { value: 'Algorithms', label: 'Algorithms' },
  { value: 'Problem Solving', label: 'Problem Solving' },
];

const SpecializationForm = ({
  department,
  setDepartment,
  skills,
  setSkills,
  handleSignUp,
  handleBack,
}) => {
  // Generate a unique ID for the department select
  const departmentId = "department-select";
  
  return (
    <div>
      <label htmlFor={departmentId} className="font-bold m-2">
        Department
      </label>
      <select
        id={departmentId}
        className="w-full border p-2 mb-4 rounded"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      >
        <option value="">Select Department</option>
        <option value="CSE">Department of CSE</option>
        <option value="AIDS">Department of AIDS</option>
        <option value="AIML">Department of AIML</option>
        <option value="CCE">Department of CCE</option>
        <option value="ECE">Department of ECE</option>
        <option value="EEE">Department of EEE</option>
        <option value="IT">Department of IT</option>
        <option value="CSBS">Department of CSBS</option>
      </select>

      <label className="font-bold m-2" id="skills-label">
        Skills
      </label>
      <Select
        aria-labelledby="skills-label"
        options={skillOptions}
        isMulti
        className="w-full mb-4"
        placeholder="Select or type skills..."
        value={skillOptions.filter((option) => skills.includes(option.value))}
        onChange={(selectedOptions) =>
          setSkills(selectedOptions.map((option) => option.value))
        }
      />

      <div className="flex gap-4">
        <button
          onClick={handleBack}
          className="w-1/2 bg-gray-400 text-white p-2 rounded hover:bg-gray-500 transition-all"
        >
          Back
        </button>

        <button
          onClick={handleSignUp}
          className="w-1/2 bg-sky-500 text-white p-2 rounded hover:bg-sky-600 transition-all"
        >
          Signup
        </button>
      </div>
    </div>
  );
};

SpecializationForm.propTypes = {
  department: PropTypes.string.isRequired,
  setDepartment: PropTypes.func.isRequired,
  skills: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSkills: PropTypes.func.isRequired,
  handleSignUp: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default SpecializationForm;