import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';

import Contacts from './components/contacts';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
class App extends Component {
  state = {
    contacts: []
  }

  componentDidMount() {
    fetch('http://jsonplaceholder.typicode.com/users')
    .then(res => res.json())
    .then((data) => {
      this.setState({ contacts: data })
    })
    .catch(console.log)
  }

  render() {
    return (
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Steve Jobs</h5>
          <h6 class="card-subtitle mb-2 text-muted">steve@apple.com</h6>
          <p class="card-text">Stay Hungry, Stay Foolish</p>
        </div>
        <Contacts contacts={this.state.contacts} />
      </div>
    );
  }
}

export default App;
