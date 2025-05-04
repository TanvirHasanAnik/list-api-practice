import axios from 'axios';
import { useEffect, useState } from 'react';
import './App.css';
const githubAccessToken = process.env.REACT_APP_GITHUB_PAT;

function Modal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{user.login}</h2>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Profile URL:</strong> <a href={user.html_url} target="_blank" rel="noopener noreferrer">{user.html_url}</a></p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function App() {
  const [userList, setUserList] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  useEffect(() => {
    if (searchTerm === '') {
      getUserList("https://api.github.com/users");
    } else {
      searchUsers(searchTerm);
    }
  }, [searchTerm]);

  async function getUserList(url) {
    try {
      const users = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`
        }
      });

      function parseLinkHeader(header) {
        const linkHeadersArray = header.split(', ');
        const linkHeadersMap = {};
      
        linkHeadersArray.forEach(link => {
          const [urlPart, relPart] = link.split('; ');
          const url = urlPart.slice(1, urlPart.length - 1); 
          const rel = relPart.replace('rel="', '').replace('"', '');
          linkHeadersMap[rel] = url;
        });
      
        return linkHeadersMap;
      }
      setUserList(users.data);

      const linkHeader = users.headers.link;
      const linkParsed = parseLinkHeader(linkHeader);
      setNextPageUrl(linkParsed.next);
    } catch (error) {
      console.log(error);
    }
  }

  async function searchUsers(query) {
    try {
      const users = await axios.get(`https://api.github.com/search/users?q=${query}+in:login`, {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`
        }
      });

      setUserList(users.data.items); // Use the items array from search results
    } catch (error) {
      console.log(error);
    }
  }

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  function UserListTable() {
    function handleViewClick(user) {
      setSelectedUser(user);
      setShowModal(true);
    }
    return (
      <table className='user_list_table'>
        <thead className='user_list_thead'>
          <tr className='user_list_heading_row'>
            <th>Id</th>
            <th>User Name</th>
            <th>Profile url</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody className='user_list_tbody'>
          {userList.map((element) => {
            return (
              <tr key={element.id} className='table_data_row'>
                <td className='user_data_id'>{element.id}</td>
                <td className='user_data_name'>{element.login}</td>
                <td className='user_data_profile_url'>{element.html_url}</td>
                <td className='user_data_action_button'>
                  <button onClick={() => handleViewClick(element)}>
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  function Pagination() {
    function handleNextClick() {
      getUserList(nextPageUrl);
    }

    function handleFirstClick() {
      getUserList("https://api.github.com/users");
    }
    return (
      <div className='pagination_wrapper'>
        <button onClick={handleFirstClick} className='first_page_button'>First</button>
        <button onClick={handleNextClick} className='next_page_button'>Next</button>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>GitHub Users</h1>
      </header>

      <main className="app-main">
        <section className="search-section">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search GitHub Users"
          />
        </section>

        <section className="user-table-section">
          <h2>User List</h2>
          <UserListTable />
        </section>

        <section className="pagination-controls">
          <Pagination />
        </section>

        {showModal && <Modal user={selectedUser} onClose={() => setShowModal(false)} />}
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} GitHub User Browser</p>
      </footer>
    </div>
  );
}

export default App;
