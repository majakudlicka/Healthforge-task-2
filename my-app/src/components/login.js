import React, {Component} from 'react';

//Login component
class Login extends Component {
  render() {
    return (
      <div className="flex-container">
        <form onSubmit="">
          <label>Username</label>
          <input id="username" type="text" />
          <label>Password</label>
          <input id="password" type="text" />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }
}

export default Login;
