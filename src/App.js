import axios from 'axios';
import { useEffect, useState } from 'react';
import './App.css';
const githubAccessToken = process.env.REACT_APP_GITHUB_PAT;

function Modal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className='modal_content_top'>
          <div className='modal_content_left'>
            <div className='user_avatar_name_wrapper'>
              <img className='user_avatar' src={user.avatar_url} alt='user_avatar'/>
              <div className='user_name_id_wrapper'>
                <h2 className='user_name'>{user.login}</h2>
                <p className='user_id'><strong>ID:</strong> {user.id}</p>
              </div>
            </div>
            <div className='url_wrapper'>
              <p><strong>Profile URL:</strong> <a href={user.html_url} target="_blank" rel="noopener noreferrer">{user.html_url}</a></p>
              <p><strong>Repos URL:</strong> <a href={user.repos_url} target="_blank" rel="noopener noreferrer">{user.repos_url}</a></p>
            </div>

          </div>
          <div className="modal_content_right">
            <p className='user_type'><strong>Type:</strong> {user.type}</p>
            <p className='user_view_type'><strong>User view type:</strong> {user.user_view_type}</p>
            <p className='user_is_admin'><strong>Site admin:</strong> {user.site_admin ? "Yes" : "No"}</p>
          </div>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

let userListArray = []

function App() {
  const [userList, setUserList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserList("https://api.github.com/users");
  },[])

  useEffect(() => {
    const timeOut = setTimeout(() => {
      if (searchWord.trim() === '') {
        setUserList([]); 
      } else {
        searchUsers(searchWord.trim());
      }
    }, 1000);

    return () => clearTimeout(timeOut);
  }, [searchWord]);

  async function getUserList(url) {
    try {
      setLoading(true);
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
      console.log(users.data)
      
      userListArray.push(users.data)
      console.log(userListArray)

      const linkHeader = users.headers.link;
      const linkParsed = parseLinkHeader(linkHeader);
      setCurrentPage(userListArray.length - 1)
      setNextPageUrl(linkParsed.next);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function searchUsers(query) {
    try {
      setLoading(true);
      const users = await axios.get('https://api.github.com/search/users', {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`
        },
        params: {
          q: `${query} in:login`
        }
      });
      setUserList(users.data.items)
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  function handleSearchChange(e) {
        setSearchWord(e.target.value)
  }

  function TableDataRow({element,handleViewClick}) {
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
    )
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
          { searchWord === "" ?
          userListArray.length > 0 &&  userListArray[currentPage].map((element) => {
                return (
                  <TableDataRow element={element} handleViewClick={handleViewClick}/>
                );
              }) :
              userList.map((element) => {
                return (
                  <TableDataRow element={element} handleViewClick={handleViewClick}/>
                );
              })
          }
        </tbody>
      </table>
    );
  }

  function Pagination() {

    function handlePreviousClick(){
      if(currentPage > 0){
        setCurrentPage(currentPage - 1)
      }
    }

    function handleFirstClick() {
      setCurrentPage(0)
    }

    function handleNextClick() {
      (currentPage < (userListArray.length - 1)) ? setCurrentPage(currentPage + 1) : getUserList(nextPageUrl);
    }
    return (
      <div className='pagination_wrapper'>
        <button onClick={handleFirstClick} className='first_page_button'>First</button>
        <button onClick={handlePreviousClick} className='previous_page_button' disabled={currentPage === 0}>Previous</button>
        <button onClick={handleNextClick} className='next_page_button'>Next</button>
        <span>{`Current Page: ${currentPage+1}`}</span>
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
            value={searchWord}
            onChange={handleSearchChange}
            placeholder="Search GitHub Users"
          />
        </section>

        <section className="user-table-section">
          <h2>User List</h2>
          <div className='user_list_table_wrapper'>
            {loading ? <p>Loading...</p> : <UserListTable />}
          </div>
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
