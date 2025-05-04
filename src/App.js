import axios from 'axios';
import { useEffect, useState } from 'react';
import './App.css';
const githubAccessToken = process.env.REACT_APP_GITHUB_PAT;



// function SearchButton({setUserList,userListAll,setSearchInputValue,searchInputValue}){
//   function handleChange(inputFieldEvent){
//     const currentText = inputFieldEvent.target.value;
//     setSearchInputValue(currentText);
//     const updatedUserList = userListAll.filter((user)=>{return user.login.toLowerCase().includes(currentText.trim().toLowerCase());});
//     setUserList(updatedUserList);
//   }
//   return <input type='text' placeholder='Search user name' value={searchInputValue} onChange={handleChange}/>
// }

function App() {

  // const [userListAll, setUserListAll] = useState([]);
  const [userList, setUserList] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  // const [searchInputValue,setSearchInputValue] = useState("");

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
        // setUserListAll(users.data);
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
        {/* <SearchButton setUserList = {setUserList}userListAll={userListAll}setSearchInputValue={setSearchInputValue} searchInputValue={searchInputValue}/> */}
        <UserListTable/>
        <Pagination/>
      </main>
    </div>
  );
}

export default App;
