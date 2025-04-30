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

  function UserDataRow(){
    return userList.map((element)=> {
        return (
            <tr key={element.id}>
                <td>{element.id}</td>
                <td>{element.login}</td>
                <td>{element.url}</td>
            </tr>
        )
    })
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
            <tbody>
                <UserDataRow/>
            </tbody>
        </table>
    )
  }
  return (
    <div className="App">
      <main>
        <UserListTable/>
      </main>
    </div>
  );
}

export default App;
