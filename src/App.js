import './App.css';
import axios from 'axios';
const githubAccessToken = process.env.REACT_APP_GITHUB_PAT;
function App() {
  function GetUsers(){
    async function handleClick(){
      try{
        //process.env.
        const users = await axios.get("https://api.github.com/users",{
          headers: {
            Authorization: `Bearer ${githubAccessToken}`
          }
        });
        console.log(users);
      } catch (error) {

      }
    }
    return <button onClick={handleClick}>User List</button>
  }
  return (
    <div className="App">
      <main>
        <GetUsers/>
      </main>
    </div>
  );
}

export default App;
