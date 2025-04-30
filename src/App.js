import './App.css';
import axios from 'axios';
import { useState,useEffect } from 'react';
const githubAccessToken = process.env.REACT_APP_GITHUB_PAT;
function App() {

  const [userList, setUserList] = useState([]);

  useEffect(()=>{
    async function getUserList(){
      try{
        const users = await axios.get("https://api.github.com/users",{
          headers: {
            Authorization: `Bearer ${githubAccessToken}`
          }
        });
        setUserList(users.data);
      } catch (error) {
        console.log(error);
      }
    }
    getUserList();
  },[]);

  function SearchButton(){
    if(userList.length > 0){
      return <input type='text' placeholder='Search user name'/>
    } else {
      return null
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
  return (
    <div className="App">
      <main>
        <SearchButton/>
        <UserListTable/>
      </main>
    </div>
  );
}

export default App;
