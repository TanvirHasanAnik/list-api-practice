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

  useEffect(()=>{
    getUserList("https://api.github.com/users");
  },[]);

  async function getUserList(url){
    try{
      const users = await axios.get(url,{
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
      console.log(linkParsed);
      setNextPageUrl(linkParsed.next);
    } catch (error) {
      console.log(error);
    }
  }

  function UserListTable(){
    function handleViewClick(user) {
      setSelectedUser(user);
      setShowModal(true);
    }
    return (
        <table>
            <thead>
                <tr>
                    <th>Id</th>
                    <th>User Name</th>
                    <th>Profile url</th>
                </tr>
            </thead>
            <tbody>{
              userList.map((element) => {
                return <tr key={element.id}>
                    <td>{element.id}</td>
                    <td>{element.login}</td>
                    <td>{element.html_url}</td>
                    <td>
                      <button onClick={()=>handleViewClick(element)}>
                      View</button>
                    </td>
                </tr>
              })
              }
            </tbody>
        </table>
    )
  }

  function Pagination(){
    function handleNextClick(){
      getUserList(nextPageUrl);
    }

    function handleFirstClick(){
      getUserList("https://api.github.com/users");
    }
    return(
      <div>
        <button onClick={handleFirstClick}>First</button>
        <button onClick={handleNextClick}>Next</button>
      </div>
    )
  }
  return (
    <div className="App">
      <main>
        <UserListTable/>
        <Pagination/>
        {showModal && <Modal user={selectedUser} onClose={() => setShowModal(false)} />}
      </main>
    </div>
  );
}

export default App;
