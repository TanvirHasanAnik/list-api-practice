import axios from 'axios';
import { useEffect, useState } from 'react';
import './App.css';
const githubAccessToken = process.env.REACT_APP_GITHUB_PAT;

function App() {
  const [userList, setUserList] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);

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
          const url = urlPart.slice(1, -1); // remove < and >
          const rel = relPart.replace('rel="', '').replace('"', '');
          linkHeadersMap[rel] = url;
        });
      
        return linkHeadersMap;
      }
      setUserList(users.data);

      const linkHeader = users.headers.link;
      const linkParsed = parseLinkHeader(linkHeader);
      console.log(linkParsed.next);
      setNextPageUrl(linkParsed.next);


    } catch (error) {
      console.log(error);
    }
  }

  function UserListTable(){
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
                    <td>{element.url}</td>
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
    return(
      <div>
        <button>Previous</button>
        <button onClick={handleNextClick}>Next</button>
      </div>
    )
  }
  return (
    <div className="App">
      <main>
        <UserListTable/>
        <Pagination/>
      </main>
    </div>
  );
}

export default App;
