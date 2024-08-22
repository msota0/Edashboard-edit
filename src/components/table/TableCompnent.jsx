import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './table.css';
import unilogo from '../../assets/uni-logo.png';
import liblogo from '../../assets/lib-logo.png';
import '@fortawesome/fontawesome-free/css/all.css';

const TableComponent = () => {
  // State variables for table data and filters
  const [showTable, setShowTable] = useState(false)
  const [filteredData, setFilteredData] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [filterStartYear, setFilterStartYear] = useState('');
  const [selectedVal, setSelectedVal] = useState('');
  const [filterEndYear, setFilterEndYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [selectedClassLevel, setSelectedClassLevel] = useState('');
  // const [jsonArray, setJsonArray] = useState([]);
  const [selectedOption, setSelectedOption] = useState('')
  const [inputValue, setInputValue] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectOptions, setSubjectOptions] = useState([
    'African American Studies', 'African Studies', 'Agriculture', 'American Indian Studies', 'American Studies',
    'Anthropology', 'Aquatic Sciences', 'Archaeology', 'Architecture & Architectural History',
    'Architecture and Architectural History', 'Art & Art History', 'Asian Studies', 'Astronomy', 'Bibliography',
    'Biological Sciences', 'Botany & Plant Sciences', 'British Studies', 'Business', 'Chemistry',
    'Classical Studies', 'Communication Studies', 'Computer Science', 'Criminology & Criminal Justice',
    'Cultural Studies', 'Development Studies', 'Developmental & Cell Biology', 'Ecology & Evolutionary Biology',
    'Economics', 'Education', 'Engineering', 'Environmental Science', 'Environmental Studies', 'European Studies',
    'Feminist & Women\'s Studies', 'Film Studies', 'Finance', 'Folklore', 'Food Studies', 'Garden & Landscape',
    'Gender Studies', 'General Science', 'Geography', 'Geology', 'Health Policy', 'Health Sciences', 'History',
    'History of Science & Technology', 'Horticulture', 'International Relations', 'Irish Studies', 'Jewish Studies',
    'Labor & Employment Relations', 'Language & Literature', 'Latin American Studies', 'Law', 'Library Science',
    'Linguistics', 'Management & Organizational Behavior', 'Marketing & Advertising', 'Mathematics',
    'Middle East Studies', 'Military Studies', 'Museum Studies', 'Music', 'Paleontology', 'Peace & Conflict Studies',
    'Performing Arts', 'Philosophy', 'Physics', 'Political Science', 'Population Studies', 'Psychology',
    'Public Health', 'Public Policy & Administration', 'Religion', 'Science & Technology Studies', 'Slavic Studies',
    'Social Work', 'Sociology', 'Statistics', 'Technology', 'Transportation Studies', 'Urban Studies', 'Zoology',
    'gardland-discipline', 'horticulture-discipline'
  ]);
  const [isVisibleYear, setIsVisibleYear] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleAvail, setIsVisibleAvail] = useState(false);
  const [isVisibleClass, setIsVisibleClass] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  

  const mapping = {
    '1': 'Textbook Title',
    '2': 'Author',
    '3': 'Subject'
  };

  // Handlers


  const handleSelection = (event) => {
    const value = event.target.value;
    setSelectedVal(value);
    setSelectedSubject(''); 
    // setFiltersApplied(false)
    setTableData([]);          
    setFilteredData([]); 
    setShowTable(false);  
    setFilterStartYear('');
    setFilterEndYear('');
    setSelectedClassLevel('')
    setSelectedAvailability('')
  };

  const handleSubjectSelection = (event) => {
    setSelectedSubject(event.target.value);
  };

  const handleInputValueChange = (event) =>{
    const value = event.target.value;
    setInputValue(value)
    console.log('value-',value)
  }

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSelectedSubject(value); // Update selected subject as user types
    // Filter subject options based on input text
    const filteredOptions = subjectOptions.filter(option =>
      option.toLowerCase().includes(value.toLowerCase())
    );
    setSubjectOptions(filteredOptions);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Form submitted');
    
    let formData = { input: inputValue };
    setShowTable(true);
  
    try {
      console.log('i am here')
      const response = await axios.post('http://127.0.0.1:5173/data', formData);
      console.log('sent data')
      console.log('Raw Response:', response.data);
  
      // Evaluate response data
      let jsonArray = Array.isArray(response.data) ? response.data : eval('(' + response.data + ')');
      console.log('Parsed Data:', jsonArray);
  
      // Set data for table and filters
      setOriginalData(jsonArray); 
      setTableData(jsonArray);
      setFilteredData(jsonArray); 
      setFiltersApplied(false);
      
    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };
  
  
  const applyFilters = () => {
    console.log('Applying Filters...');
  
    const newFilteredData = tableData.filter(book => {
      const copyrightYear = parseInt(book['Copyright Year'], 10);
  
      const isWithinYearRange = (
        (filterStartYear === '' || copyrightYear >= parseInt(filterStartYear, 10)) &&
        (filterEndYear === '' || copyrightYear <= parseInt(filterEndYear, 10))
      );
  
      const isAvailable = selectedAvailability === 'available' ? book['Available'] === 'Y' : true;
      const isUnavailable = selectedAvailability === 'unavailable' ? book['Available'] === 'N' : true;
  
      const isCorrectClassLevel = (
        selectedClassLevel === '' ||
        (selectedClassLevel === '1' && book['Class Level'] === 'UG') ||
        (selectedClassLevel === '2' && book['Class Level'] === 'G')
      );
  
      return isWithinYearRange && isAvailable && isUnavailable && isCorrectClassLevel;
    });

    const applyFiltersQuery = async (event) => {
      const queryData = {
        startYear: filterStartYear,
        endYear: filterEndYear,
        available: selectedAvailability,
        classLevel: selectedClassLevel,
        option: selectedOption,
        input: inputValue,
        subject: selectedSubject,
      };

      try {
        console.log('Sending data to backend...');
        const response = await axios.post('http://127.0.0.1:5173/query', queryData);
        console.log('Response data:', response.data);
        
        // Set data for table and filters
        setOriginalData(response.data);
        setTableData(response.data);
        setFilteredData(response.data);
        setFiltersApplied(false);
      } catch (error) {
        console.error('Error sending data to backend:', error);
      }
    }
  
    console.log('Filtered Data:', newFilteredData);
    setFilteredData(newFilteredData);
    setFiltersApplied(true);
  };
  

  const resetFilters = () =>{
    setFilterStartYear('');
    setFilterEndYear('');
    setSelectedClassLevel('')
    setSelectedAvailability('')
    setFilteredData(originalData);
    filtersApplied(false)
  }

  const itemsPerPage = 50;

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (typeof aValue === 'undefined') return sortOrder === 'asc' ? -1 : 1;
    if (typeof bValue === 'undefined') return sortOrder === 'asc' ? 1 : -1;

    return sortOrder === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterStartYearChange = (event) => {
    setFilterStartYear(event.target.value);
    setCurrentPage(1);
  };

  const handleFilterEndYearChange = (event) => {
    setFilterEndYear(event.target.value);
    setCurrentPage(1);
  };

  const handleSelectionOption = (event) =>{
    setSelectedOption(event.target.value)
  }

  const handleAvailabilityChange = (event) => {
    setSelectedAvailability(event.target.value);
    setCurrentPage(1);
  };

  const handleClassLevelChange = (event) => {
    setSelectedClassLevel(event.target.value);
    setCurrentPage(1);
  };

  const sendEmail = (check, bookTitle) => {
    if (check === false) {
      alert(`We're sorry, the '${bookTitle}' book is unavailable at the moment. Please email bwyoung@olemiss.edu about your requirements.`);
    } else if (check === true) {
      alert(`The '${bookTitle}' book is available!`);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  }

  const toggleVisibilityYear = () => {
    setIsVisibleYear(!isVisibleYear);
  };

  const toggleVisibilityAvail = () => {
    setIsVisibleAvail(!isVisibleAvail);
  };

  const toggleVisibilityClass = () => {
    setIsVisibleClass(!isVisibleClass);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  useEffect(() => {
    console.log('Table Data:', tableData);
    console.log('Filtered Data:', filteredData);
    console.log('Filters Applied:', filtersApplied);
    console.log('Filtered Data Length > 0:', filteredData.length > 0);
  }, [tableData, filteredData, filtersApplied]);
  
  
  const table_class = visibleData.length <= 50 ? 'table-v1' : 'table-v2';

  return (
    <div className={table_class}>
      <div className='uni-name'><img src={unilogo} className='uni' alt="University Logo" /></div>
      <div className='unilogo'><img src={liblogo} className='lib' alt="Library Logo" /></div>
      <div className='red-div'></div>
      <div className='blue-div'></div>
      <h2 className='title'>EBooks for your search</h2>
      {!showTable && 
        <div className='instr-cont'>
          <p className='instructions'>
          The Edashboard project aims to create a user-friendly tool for  Ole Miss instructors. <br /> This dashboard will enable instructors to easily filter and discover ebooks that offer unlimited access within the Ole Miss' digital library. </p>
          <p className='instructions'>Choose your filter type and enter your search <br /></p>
          <p className='instructions'></p>
      </div>
      }
      <form onSubmit={handleSubmit}>
        <div className='initial-search'>
          <div><input type="text" className='names' placeholder='Enter Search Here' required  onChange={handleInputValueChange} /></div>
          <div className='button-cont'>
            <button type="submit">Submit</button>
          </div>
        </div>
      </form>
      {showTable &&
      <div className='main-container'>
        <div className='section-one'>
          <h3>Refine Your Search</h3>
          <div>
            <label>Target Filter:</label> <button className="btn" onClick={toggleVisibility}><i className="fa fa-angle-down"></i></button>
            {isVisible && (
                <>
                  <div className='filter-by'>
                    <label>Filter input field by: </label>
                    <select value={selectedVal} onChange={handleSelectionOption} required className='filters'>
                      <option value="" disabled hidden>Filter By</option>
                      <option value="1">Book Title</option>
                      <option value="2">Author</option>
                    </select>
                  </div>
                  <div>
                    <label>Subject: </label>
                    <select value={selectedSubject} onChange={handleSubjectSelection} className='subjects' required>
                      <option value="" disabled hidden>Select Subject...</option>
                      {subjectOptions.map((subject, index) => (
                        <option className='subjects' key={index} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
          </div>
          
          <div>
            <label htmlFor="filterStartYear">Filter by Copyright Year Range:</label> <button className="btn" onClick={toggleVisibilityYear}><i className="fa fa-angle-down"></i></button>
            {isVisibleYear && (
              <div className='yearFilter-cont'>
                <input
                  className='year'
                  type="text"
                  id="filterStartYear"
                  name="filterStartYear"
                  value={filterStartYear}
                  onChange={handleFilterStartYearChange}
                  placeholder="Start year..."
                />
                <input
                  className='year'
                  type="text"
                  id="filterEndYear"
                  name="filterEndYear"
                  value={filterEndYear}
                  onChange={handleFilterEndYearChange}
                  placeholder="End year..."
                />
              </div>
            )}
          </div>

          <div className='avail'>
            <label>Filter by Availability:</label> <button className="btn" onClick={toggleVisibilityAvail}><i className="fa fa-angle-down"></i></button> <br />
            {isVisibleAvail && (
              <div className='radio-cont'>
                <div>
                  <input
                    className='radio'
                    type="radio"
                    id="available"
                    name="availability"
                    value="available"
                    checked={selectedAvailability === 'available'}
                    onChange={handleAvailabilityChange}
                  />
                  <label htmlFor="available">Available</label>
                </div>

                <div>
                  <input
                    className='radio'
                    type="radio"
                    id="unavailable"
                    name="availability"
                    value="unavailable"
                    checked={selectedAvailability === 'unavailable'}
                    onChange={handleAvailabilityChange}
                  />
                  <label htmlFor="unavailable">Unavailable</label>
                </div>
              </div>
            )}
          </div>

          <div className='class-level'>
            <label>Filter by Class Level:</label> <button className="btn" onClick={toggleVisibilityClass}><i className="fa fa-angle-down"></i></button>
            {isVisibleClass && (
              <div className='radio-cont'>
                <div>
                  <input
                    className='radio'
                    type="radio"
                    id="undergraduate"
                    name="classLevel"
                    value="1"
                    checked={selectedClassLevel === '1'}
                    onChange={handleClassLevelChange}
                  />
                  <label htmlFor="undergraduate">Undergraduate</label>
                </div>
                <div>
                  <input
                    className='radio'
                    type="radio"
                    id="graduate"
                    name="classLevel"
                    value="2"
                    checked={selectedClassLevel === '2'}
                    onChange={handleClassLevelChange}
                  />
                  <label htmlFor="graduate">Graduate</label>
                </div>
              </div>
            )}
          </div>
          <button type='button' onClick={() => applyFilters()}>Apply Filters</button>
          <button type='button' onClick = {() => resetFilters()}>Reset Filters</button>
        </div>

        <div className='section-two'>
          {filteredData.length > 0 ? (
            <table>
              <colgroup>
                <col style={{ width: '5%' }} /> 
                <col style={{ width: '35%' }} /> 
                <col style={{ width: '3%' }} /> 
                <col style={{ width: '25%' }} /> 
                <col style={{ width: '15%' }} /> 
                <col style={{ width: '35%' }} /> 
                <col style={{ width: '3%' }} /> 
              </colgroup>

              <thead>
                <tr className='heading'>
                  <th></th>
                  <th onClick={() => handleSort('Book Title')} className='ordering'>
                    Book Title {sortBy === 'Book Title' && <i className={`fa fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
                  </th>
                  <th onClick={() => handleSort('Copyright Year')} className='ordering'>
                    Copyright Year {sortBy === 'Copyright Year' && <i className={`fa fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
                  </th>
                  <th>Discipline</th>
                  <th>Author</th>
                  <th>Publisher</th>
                  <th>Class Level</th>
                </tr>
              </thead>
              <tbody>
                {visibleData.map((book, index) => (
                  <tr key={index}>
                    <td>
                      {book['Available'] === 'N' ? (
                        <div className={book['Available']} onClick={() => sendEmail(false, book['Book Title'])}>
                          <button className='request'>Request</button>
                        </div>
                      ) : null}
                    </td>
                    <td>
                      {book['title_url'] ? (
                        <a className='links' href={book['title_url']} target="_blank" rel="noopener noreferrer">{book['Book Title'] || ''}</a>
                      ) : (
                        book['Book Title'] || ''
                      )}
                    </td>
                    <td>{book['Copyright Year'] || ''}</td>
                    <td>{book['Discipline'] || ''}</td>
                    <td>{book['First Author'] || ''}</td>
                    <td>{book['Publisher'] || ''}</td>
                    <td>{book['Class Level'] || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='no-data'>No data available for the selected filters.</div>
          )}

          {filteredData.length > itemsPerPage && (
            <div className='pagination'>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={currentPage === index + 1 ? 'active' : ''}
                >
                  {index + 1}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          )}
        </div>
      </div>
      }
      
    </div>
  );
};

export default TableComponent;
